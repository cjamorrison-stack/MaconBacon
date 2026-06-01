import { useEffect, useMemo, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { parts, technicians, clients, jobs as initialJobs, quotes as initialQuotes, JobRequest, Quote } from './data';

const locationOptions = ['All locations', 'Johannesburg, ZA', 'Lagos, NG', 'Nairobi, KE', 'Cairo, EG', 'Accra, GH'];
const categoryOptions = ['All categories', 'Pumps', 'Valves', 'Seals', 'Motors', 'Belts'];
const priorityOptions = ['Urgent', 'High', 'Medium', 'Low'];

function matchesLocation(itemLocation: string, locationFilter: string) {
  return locationFilter === 'All locations' || itemLocation.includes(locationFilter.split(',')[0]);
}

function matchesQuery(text: string, query: string) {
  return text.toLowerCase().includes(query.toLowerCase());
}

function App() {
  const [locationFilter, setLocationFilter] = useState(locationOptions[0]);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(categoryOptions[0]);
  const [jobs, setJobs] = useState<JobRequest[]>(initialJobs);
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [selectedQuoteJob, setSelectedQuoteJob] = useState('');
  const [newJob, setNewJob] = useState({ title: '', location: '', equipment: '', priority: 'Urgent', description: '' });
  const [quoteForm, setQuoteForm] = useState({ technician: '', amount: '', leadTime: '', message: '' });

  const filteredTechnicians = useMemo(() => {
    return technicians.filter((tech) => {
      return (
        matchesLocation(tech.location, locationFilter) &&
        (query === '' || matchesQuery(`${tech.name} ${tech.expertise.join(' ')} ${tech.certifications.join(' ')}`, query))
      );
    });
  }, [locationFilter, query]);

  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const categoryMatch = categoryFilter === 'All categories' || part.category === categoryFilter;
      const locationMatch = matchesLocation(part.supplierLocation, locationFilter);
      const queryMatch = query === '' || matchesQuery(`${part.name} ${part.supplier}`, query);
      return categoryMatch && locationMatch && queryMatch;
    });
  }, [categoryFilter, locationFilter, query]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const locationMatch = matchesLocation(job.location, locationFilter);
      const queryMatch = query === '' || matchesQuery(`${job.title} ${job.equipment} ${job.description} ${job.location}`, query);
      return locationMatch && queryMatch;
    });
  }, [jobs, locationFilter, query]);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const locationMatch = matchesLocation(client.location, locationFilter);
      const queryMatch = query === '' || matchesQuery(`${client.name} ${client.company} ${client.role} ${client.location}`, query);
      return locationMatch && queryMatch;
    });
  }, [locationFilter, query]);

  const supplierLocationsMap = useMemo(() => {
    const grouped = filteredParts
      .filter((part) => part.stock > 0)
      .reduce<Record<string, { supplier: string; count: number; stock: number; coords: [number, number] }>>((acc, part) => {
        const existing = acc[part.supplierLocation];
        if (existing) {
          existing.count += 1;
          existing.stock += part.stock;
        } else {
          acc[part.supplierLocation] = {
            supplier: part.supplier,
            count: 1,
            stock: part.stock,
            coords: part.supplierCoordinates,
          };
        }
        return acc;
      }, {});

    return Object.entries(grouped).map(([location, info]) => ({
      location,
      supplier: info.supplier,
      partsAvailable: info.count,
      totalStock: info.stock,
      coords: info.coords,
    }));
  }, [filteredParts]);

  const visibleTechnicians = useMemo(
    () => filteredTechnicians.filter((tech) => Boolean(tech.coordinates)),
    [filteredTechnicians],
  );

  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markerLayer = useRef<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) {
      return;
    }

    leafletMap.current = L.map(mapRef.current, {
      center: [4.0, 20.0],
      zoom: 4,
      minZoom: 3,
      maxZoom: 7,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(leafletMap.current);

    markerLayer.current = L.featureGroup().addTo(leafletMap.current);

    return () => {
      markerLayer.current?.clearLayers();
      leafletMap.current?.remove();
      leafletMap.current = null;
      markerLayer.current = null;
    };
  }, []);

  useEffect(() => {
    if (!leafletMap.current || !markerLayer.current) {
      return;
    }

    markerLayer.current.clearLayers();

    const techIcon = L.divIcon({
      className: 'map-marker-icon tech',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      html: '<span />',
    });

    const supplierIcon = L.divIcon({
      className: 'map-marker-icon supplier',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      html: '<span />',
    });

    visibleTechnicians.forEach((technician) => {
      const marker = L.marker(technician.coordinates, { icon: techIcon })
        .bindPopup(`<strong>${technician.name}</strong><br/>${technician.location}`);
      markerLayer.current!.addLayer(marker);
    });

    supplierLocationsMap.forEach((supplier) => {
      const marker = L.marker(supplier.coords, { icon: supplierIcon })
        .bindPopup(`<strong>${supplier.supplier}</strong><br/>${supplier.location}<br/>${supplier.partsAvailable} stocked items`);
      markerLayer.current!.addLayer(marker);
    });

    const groupBounds = markerLayer.current.getBounds();
    if (groupBounds.isValid()) {
      leafletMap.current.fitBounds(groupBounds.pad(0.35), { maxZoom: 6, animate: true });
    }
  }, [visibleTechnicians, supplierLocationsMap]);

  const totalStock = parts.reduce((sum, part) => sum + part.stock, 0);
  const quoteCount = quotes.length;
  const selectedJob = jobs.find((job) => job.id === selectedQuoteJob);

  const handleNewJobChange = (field: keyof typeof newJob, value: string) => {
    setNewJob((current) => ({ ...current, [field]: value }));
  };

  const handleQuoteChange = (field: keyof typeof quoteForm, value: string) => {
    setQuoteForm((current) => ({ ...current, [field]: value }));
  };

  const submitJob = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newJob.title || !newJob.location || !newJob.equipment || !newJob.description) {
      return;
    }

    setJobs((current) => [
      ...current,
      {
        id: `job-${Date.now()}`,
        title: newJob.title,
        location: newJob.location,
        equipment: newJob.equipment,
        priority: newJob.priority,
        description: newJob.description,
        requestedBy: 'Plant operations',
        status: 'Open',
        createdAt: 'Just now',
      },
    ]);

    setNewJob({ title: '', location: '', equipment: '', priority: 'Urgent', description: '' });
  };

  const submitQuote = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedQuoteJob || !quoteForm.technician || !quoteForm.amount || !quoteForm.leadTime) {
      return;
    }

    setQuotes((current) => [
      ...current,
      {
        id: `quote-${Date.now()}`,
        jobId: selectedQuoteJob,
        technician: quoteForm.technician,
        amount: quoteForm.amount,
        leadTime: quoteForm.leadTime,
        message: quoteForm.message,
        submittedAt: 'Just now',
      },
    ]);

    setQuoteForm({ technician: '', amount: '', leadTime: '', message: '' });
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">PlantServ</p>
          <h1>Rapid repair and part sourcing for African food plants</h1>
          <p>Find certified technicians, local suppliers, and let service teams quote on urgent processing plant work.</p>
          <div className="hero-actions">
            <button type="button">Search specialists</button>
            <button type="button" className="secondary">Browse spare parts</button>
          </div>
        </div>

        <div className="hero-metrics">
          <article className="metric-card">
            <p>Technicians</p>
            <strong>{technicians.length}</strong>
          </article>
          <article className="metric-card">
            <p>Quotes submitted</p>
            <strong>{quoteCount}</strong>
          </article>
          <article className="metric-card">
            <p>Supported hubs</p>
            <strong>{locationOptions.length - 1}</strong>
          </article>
        </div>
      </header>

      <section className="controls">
        <div className="search-panel">
          <label>
            Search by skill, machine, or supplier
            <input
              type="search"
              value={query}
              placeholder="e.g. sanitary valve, CIP pump, motor rebuild"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="search-tags">
            <span>HACCP-ready</span>
            <span>Sanitary equipment</span>
            <span>Emergency support</span>
            <span>Local stock</span>
          </div>
        </div>

        <div className="filters-grid">
          <label>
            Location
            <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
              {locationOptions.map((location) => (
                <option value={location} key={location}>{location}</option>
              ))}
            </select>
          </label>

          <label>
            Part category
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              {categoryOptions.map((category) => (
                <option value={category} key={category}>{category}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="panel map-panel">
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">Map view</p>
            <h2>Technicians and stocked suppliers</h2>
          </div>
          <span>{visibleTechnicians.length + supplierLocationsMap.length} locations</span>
        </div>

        <div className="map-card">
          <div className="map-visual" ref={mapRef} aria-label="Regional technician and supplier map" />

          <aside className="map-legend">
            <div className="legend-summary">
              <p className="small-meta">Map overview</p>
              <p>{visibleTechnicians.length} technicians · {supplierLocationsMap.length} stocked supplier hubs</p>
            </div>
            <div className="legend-item">
              <span className="legend-dot tech" />
              <div>
                <strong>Technicians</strong>
                <p>Local specialists ready to dispatch.</p>
              </div>
            </div>
            <div className="legend-item">
              <span className="legend-dot supplier" />
              <div>
                <strong>Suppliers</strong>
                <p>Parts suppliers with stock available now.</p>
              </div>
            </div>
            {supplierLocationsMap.map((supplier) => (
              <div key={supplier.location} className="legend-item supplier-entry">
                <span>{supplier.location}</span>
                <small>{supplier.partsAvailable} items · {supplier.totalStock} pieces</small>
              </div>
            ))}
          </aside>
        </div>
      </section>

      <main className="content-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-eyebrow">Service network</p>
              <h2>Certified technicians near you</h2>
            </div>
            <span>{filteredTechnicians.length} found</span>
          </div>

          <div className="card-grid">
            {filteredTechnicians.map((technician) => (
              <article className="card" key={technician.id}>
                <div className="card-title-row">
                  <div>
                    <h3>{technician.name}</h3>
                    <p className="small-meta">{technician.location}</p>
                  </div>
                  <span className="badge">{technician.distanceKm} km</span>
                </div>
                <p className="meta">Available: {technician.availability}</p>
                <p className="description">{technician.expertise.join(', ')}</p>
                <div className="stats-row">
                  <span className="pill">{technician.certifications.join(', ')}</span>
                  <span>{technician.rating} ★ rating</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-eyebrow">Parts</p>
              <h2>Supplier inventory</h2>
            </div>
            <span>{filteredParts.length} found</span>
          </div>

          <div className="card-grid">
            {filteredParts.map((part) => (
              <article className="card" key={part.id}>
                <div className="card-title-row">
                  <div>
                    <h3>{part.name}</h3>
                    <p className="small-meta">{part.supplier}</p>
                  </div>
                  <span className="badge badge-secondary">{part.category}</span>
                </div>
                <p className="meta">{part.supplierLocation}</p>
                <p className="description">Stock: {part.stock} • Lead time: {part.leadTime}</p>
                <div className="stats-row">
                  <span>Price: {part.price}</span>
                  <span>{part.logistics}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-eyebrow">Clients</p>
              <h2>Customer contacts</h2>
            </div>
            <span>{filteredClients.length} contacts</span>
          </div>

          <div className="card-grid client-grid">
            {filteredClients.map((client) => (
              <article className="card" key={client.id}>
                <div className="card-title-row">
                  <div>
                    <h3>{client.name}</h3>
                    <p className="small-meta">{client.company}</p>
                  </div>
                  <span className="badge">{client.role}</span>
                </div>
                <p className="meta">{client.location}</p>
                <p className="description">Phone: {client.phone}</p>
                <div className="stats-row">
                  <span>Email: {client.email}</span>
                  <span>{client.status}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <section className="panel job-panel">
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">Job board</p>
            <h2>Log work requests and receive quotes</h2>
          </div>
          <span>{filteredJobs.length} active requests</span>
        </div>

        <div className="job-board-grid">
          <div className="job-side">
            <article className="job-form card">
              <h3>Log a new job request</h3>
              <form onSubmit={submitJob}>
                <label>
                  Request title
                  <input
                    type="text"
                    value={newJob.title}
                    onChange={(event) => handleNewJobChange('title', event.target.value)}
                    placeholder="e.g. Clean-in-place pump leak"
                  />
                </label>

                <label>
                  Location
                  <input
                    type="text"
                    value={newJob.location}
                    onChange={(event) => handleNewJobChange('location', event.target.value)}
                    placeholder="e.g. Lagos, NG"
                  />
                </label>

                <label>
                  Equipment
                  <input
                    type="text"
                    value={newJob.equipment}
                    onChange={(event) => handleNewJobChange('equipment', event.target.value)}
                    placeholder="e.g. CIP pump"
                  />
                </label>

                <label>
                  Priority
                  <select
                    value={newJob.priority}
                    onChange={(event) => handleNewJobChange('priority', event.target.value)}
                  >
                    {priorityOptions.map((option) => (
                      <option value={option} key={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Description
                  <textarea
                    value={newJob.description}
                    onChange={(event) => handleNewJobChange('description', event.target.value)}
                    placeholder="Describe the fault, equipment location, and urgency."
                    rows={4}
                  />
                </label>

                <button type="submit">Log request</button>
              </form>
            </article>

            <article className="quote-panel card">
              <h3>Technician quote</h3>
              <p className="quote-note">
                {selectedJob
                  ? `Quoting job: ${selectedJob.title}`
                  : 'Select a request to add a quote.'}
              </p>
              <form onSubmit={submitQuote}>
                <label>
                  Technician name
                  <input
                    type="text"
                    value={quoteForm.technician}
                    onChange={(event) => handleQuoteChange('technician', event.target.value)}
                    placeholder="e.g. Amina Okafor"
                    disabled={!selectedJob}
                  />
                </label>

                <label>
                  Amount
                  <input
                    type="text"
                    value={quoteForm.amount}
                    onChange={(event) => handleQuoteChange('amount', event.target.value)}
                    placeholder="e.g. $425"
                    disabled={!selectedJob}
                  />
                </label>

                <label>
                  Lead time
                  <input
                    type="text"
                    value={quoteForm.leadTime}
                    onChange={(event) => handleQuoteChange('leadTime', event.target.value)}
                    placeholder="e.g. 24 hours"
                    disabled={!selectedJob}
                  />
                </label>

                <label>
                  Notes
                  <textarea
                    value={quoteForm.message}
                    onChange={(event) => handleQuoteChange('message', event.target.value)}
                    placeholder="Add repair, parts, or availability details."
                    rows={3}
                    disabled={!selectedJob}
                  />
                </label>

                <button type="submit" disabled={!selectedJob}>Submit quote</button>
              </form>
            </article>
          </div>

          <div className="job-list">
            {filteredJobs.map((job) => {
              const jobQuotes = quotes.filter((quote) => quote.jobId === job.id);

              return (
                <article className="job-card card" key={job.id}>
                  <div className="job-card-header">
                    <div>
                      <p className="eyebrow">Request</p>
                      <h3>{job.title}</h3>
                    </div>
                    <span className={`job-status status-${job.status.toLowerCase().replace(' ', '-')}`}>{job.status}</span>
                  </div>

                  <div className="job-details">
                    <span>{job.location}</span>
                    <span>{job.equipment}</span>
                    <span>{job.priority}</span>
                  </div>

                  <p className="description">{job.description}</p>
                  <div className="job-meta">
                    <span>{job.requestedBy}</span>
                    <span>{job.createdAt}</span>
                  </div>

                  <div className="quote-list">
                    {jobQuotes.length > 0 ? (
                      jobQuotes.map((quote) => (
                        <article className="quote-item" key={quote.id}>
                          <strong>{quote.technician}</strong>
                          <span>{quote.amount} · {quote.leadTime}</span>
                          <p>{quote.message}</p>
                          <small>{quote.submittedAt}</small>
                        </article>
                      ))
                    ) : (
                      <p className="quote-empty">No quotes yet.</p>
                    )}
                  </div>

                  <button type="button" className="secondary" onClick={() => setSelectedQuoteJob(job.id)}>
                    Quote this job
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;

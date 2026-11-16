"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import GoogleMap from "./components/GoogleMap";

type IconName =
  | "activity"
  | "arrow-down"
  | "arrow-up"
  | "bell"
  | "calendar"
  | "check"
  | "chevron"
  | "clock"
  | "compass"
  | "fuel"
  | "grid"
  | "help"
  | "layers"
  | "location"
  | "menu"
  | "more"
  | "route"
  | "search"
  | "settings"
  | "truck"
  | "users"
  | "wifi";

const iconPaths: Record<IconName, ReactNode> = {
  activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  "arrow-down": <path d="m7 10 5 5 5-5" />,
  "arrow-up": <path d="m7 14 5-5 5 5" />,
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" />
    </>
  ),
  fuel: (
    <>
      <path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M3 21h13M7 7h5v5H7z" />
      <path d="M15 8h2l3 3v7a2 2 0 0 1-4 0v-4" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9a2.5 2.5 0 1 1 4.2 1.8c-1.1 1-1.8 1.2-1.8 3M12 17h.01" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
    </>
  ),
  location: (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 18h3a3 3 0 0 0 3-3v-3a3 3 0 0 1 3-3h1" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.5-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.9l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.5 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.5 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.9l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.5-1.4 1.1a7 7 0 0 1 0 2Z" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6h11v12H3zM14 10h4l3 3v5h-7z" />
      <circle cx="7.5" cy="18" r="2" />
      <circle cx="17.5" cy="18" r="2" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
    </>
  ),
  wifi: (
    <>
      <path d="M5 9a11 11 0 0 1 14 0M8 12a6.5 6.5 0 0 1 8 0m-5 7h.01" />
      <path d="M3 6a15 15 0 0 1 18 0" />
    </>
  ),
};

function Icon({
  name,
  size = 18,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconPaths[name]}
    </svg>
  );
}

const vehicles = [
  {
    id: "VH-2048",
    name: "Ford Transit",
    driver: "Marcus Chen",
    initials: "MC",
    color: "mint",
    latitude: 37.7749,
    longitude: -122.4194,
    status: "Moving",
    speed: "42 mph",
    location: "Downtown · 8th Avenue",
    time: "2 min ago",
  },
  {
    id: "VH-1082",
    name: "Mercedes Sprinter",
    driver: "Olivia Martinez",
    initials: "OM",
    color: "blue",
    latitude: 37.7599,
    longitude: -122.4148,
    status: "Moving",
    speed: "28 mph",
    location: "Mission District",
    time: "4 min ago",
  },
  {
    id: "VH-3411",
    name: "Toyota Hilux",
    driver: "James Wilson",
    initials: "JW",
    color: "amber",
    latitude: 37.7858,
    longitude: -122.401,
    status: "Idle",
    speed: "0 mph",
    location: "SOMA · 3rd Street",
    time: "12 min ago",
  },
  {
    id: "VH-0926",
    name: "Ford Ranger",
    driver: "Ava Thompson",
    initials: "AT",
    color: "lilac",
    latitude: 37.8014,
    longitude: -122.435,
    status: "Moving",
    speed: "35 mph",
    location: "Marina Boulevard",
    time: "1 min ago",
  },
];

const activity = [
  {
    icon: "check" as const,
    tone: "green",
    title: "Delivery completed",
    detail: "Marcus Chen · Order #4821",
    time: "10:42 AM",
  },
  {
    icon: "fuel" as const,
    tone: "orange",
    title: "Fuel stop",
    detail: "Olivia Martinez · Shell, Market St",
    time: "10:18 AM",
  },
  {
    icon: "location" as const,
    tone: "blue",
    title: "Route started",
    detail: "Ava Thompson · Route 08",
    time: "9:56 AM",
  },
];

const weeklyDistance = [
  { day: "Mon", value: 72 },
  { day: "Tue", value: 88 },
  { day: "Wed", value: 62 },
  { day: "Thu", value: 96 },
  { day: "Fri", value: 76 },
  { day: "Sat", value: 48 },
  { day: "Sun", value: 36 },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedVehicle, setSelectedVehicle] = useState("VH-2048");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleVehicles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      const matchesStatus =
        statusFilter === "All" || vehicle.status === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${vehicle.name} ${vehicle.id} ${vehicle.driver} ${vehicle.location}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter]);

  return (
    <div className="dashboard-shell">
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <a
          className="brand"
          href="#overview"
          aria-label="Trackline home"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="brand-mark">
            <Icon name="route" size={21} />
          </span>
          <span className="brand-name">Trackline</span>
          <span className="brand-period">.</span>
        </a>

        <div className="workspace-switcher">
          <span className="workspace-avatar">N</span>
          <span className="workspace-copy">
            <strong>Northstar Logistics</strong>
            <small>Fleet workspace</small>
          </span>
          <Icon name="arrow-down" size={15} />
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-link active" href="#overview" onClick={() => setMobileMenuOpen(false)}>
            <Icon name="grid" />
            <span>Overview</span>
          </a>
          <a className="nav-link" href="#map" onClick={() => setMobileMenuOpen(false)}>
            <Icon name="location" />
            <span>Live map</span>
            <span className="nav-count">24</span>
          </a>
          <a className="nav-link" href="#vehicles" onClick={() => setMobileMenuOpen(false)}>
            <Icon name="truck" />
            <span>Vehicles</span>
          </a>
          <a className="nav-link" href="#activity" onClick={() => setMobileMenuOpen(false)}>
            <Icon name="route" />
            <span>Trips &amp; routes</span>
          </a>
          <a className="nav-link" href="#activity" onClick={() => setMobileMenuOpen(false)}>
            <Icon name="activity" />
            <span>Reports</span>
          </a>
        </nav>

        <p className="nav-label nav-label-spaced">PREFERENCES</p>
        <nav className="side-nav" aria-label="Preferences">
          <a className="nav-link" href="#team" onClick={() => setMobileMenuOpen(false)}>
            <Icon name="users" />
            <span>Team</span>
          </a>
          <a className="nav-link" href="#settings" onClick={() => setMobileMenuOpen(false)}>
            <Icon name="settings" />
            <span>Settings</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="plan-card">
            <div className="plan-icon">
              <Icon name="compass" size={17} />
            </div>
            <strong>Fleet health</strong>
            <p>Your vehicles are running smoothly.</p>
            <div className="plan-progress">
              <span />
            </div>
            <small>22 of 24 vehicles online</small>
          </div>
          <a className="nav-link help-link" href="#help" onClick={() => setMobileMenuOpen(false)}>
            <Icon name="help" />
            <span>Help center</span>
          </a>
          <div className="profile">
            <span className="profile-avatar">SK</span>
            <span className="profile-copy">
              <strong>Saurav Kumar</strong>
              <small>Fleet administrator</small>
            </span>
            <Icon name="more" size={18} />
          </div>
        </div>
      </aside>
      {mobileMenuOpen && (
        <button
          className="menu-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="main-content" id="overview">
        <header className="topbar">
          <button
            className="mobile-menu"
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
          >
            <Icon name="menu" />
          </button>
          <div className="breadcrumb">
            <span>Workspace</span>
            <Icon name="chevron" size={14} />
            <strong>Overview</strong>
          </div>
          <div className="topbar-actions">
            <label className="global-search">
              <Icon name="search" size={17} />
              <input
                type="search"
                placeholder="Search vehicles..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search vehicles"
              />
              <kbd>⌘ K</kbd>
            </label>
            <span className="topbar-divider" />
            <span className="sync-status">
              <span className="sync-dot" />
              All systems operational
            </span>
            <button className="icon-button notification-button" aria-label="Notifications">
              <Icon name="bell" size={19} />
              <span />
            </button>
            <span className="profile-avatar top-avatar">SK</span>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow">MONDAY, NOVEMBER 16, 2026</div>
              <h1>Good morning, Saurav <span>✦</span></h1>
              <p>Here&apos;s what&apos;s happening with your fleet today.</p>
            </div>
            <button className="date-button">
              <Icon name="calendar" size={17} />
              Today, Nov 16
              <Icon name="arrow-down" size={15} />
            </button>
          </section>

          <section className="stat-grid" aria-label="Fleet overview statistics">
            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon mint-icon"><Icon name="truck" size={19} /></span>
                <span className="stat-trend positive"><Icon name="arrow-up" size={14} /> 8.2%</span>
              </div>
              <p className="stat-label">Total vehicles</p>
              <div className="stat-value">24 <span className="stat-unit">vehicles</span></div>
              <div className="stat-foot"><span className="status-dot green-dot" /> 18 on the road <span className="stat-separator">·</span> 4 idle</div>
            </article>
            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon blue-icon"><Icon name="location" size={19} /></span>
                <span className="stat-trend positive"><Icon name="arrow-up" size={14} /> 12.5%</span>
              </div>
              <p className="stat-label">On the road</p>
              <div className="stat-value">18 <span className="stat-unit">vehicles</span></div>
              <div className="stat-foot"><span className="status-dot green-dot" /> 75% of your fleet</div>
            </article>
            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon violet-icon"><Icon name="route" size={19} /></span>
                <span className="stat-trend positive"><Icon name="arrow-up" size={14} /> 4.6%</span>
              </div>
              <p className="stat-label">Distance covered</p>
              <div className="stat-value">1,284 <span className="stat-unit">mi</span></div>
              <div className="stat-foot">Across <strong>42 trips</strong> today</div>
            </article>
            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon orange-icon"><Icon name="fuel" size={19} /></span>
                <span className="stat-trend positive"><Icon name="arrow-up" size={14} /> 2.4%</span>
              </div>
              <p className="stat-label">Fuel efficiency</p>
              <div className="stat-value">8.4 <span className="stat-unit">mpg avg.</span></div>
              <div className="stat-foot">vs. 8.2 mpg last week</div>
            </article>
          </section>

          <section className="dashboard-grid">
            <article className="panel map-panel" id="map">
              <div className="panel-heading map-heading">
                <div>
                  <div className="panel-title-row">
                    <h2>Fleet map</h2>
                    <span className="live-tag"><span /> DEMO</span>
                  </div>
                  <p>Sample vehicle positions · San Francisco</p>
                </div>
              </div>

              <GoogleMap
                vehicles={vehicles}
                selectedVehicle={selectedVehicle}
                onVehicleSelect={setSelectedVehicle}
              />

              <div className="map-footer">
                <div className="map-legend">
                  <span><i className="legend-dot moving-dot" /> Moving <b>18</b></span>
                  <span><i className="legend-dot idle-dot" /> Idle <b>4</b></span>
                  <span><i className="legend-dot service-dot" /> In service <b>2</b></span>
                </div>
                <a className="text-link" href="#vehicles">View all vehicles <Icon name="chevron" size={14} /></a>
              </div>
            </article>

            <article className="panel vehicles-panel" id="vehicles">
              <div className="panel-heading vehicle-heading">
                <div>
                  <h2>Vehicles nearby</h2>
                  <p>4 vehicles in this area</p>
                </div>
                <button className="icon-button subtle-button" aria-label="More vehicle options">
                  <Icon name="more" size={18} />
                </button>
              </div>
              <div className="vehicle-filters" role="group" aria-label="Filter vehicles by status">
                {["All", "Moving", "Idle"].map((filter) => (
                  <button
                    className={statusFilter === filter ? "filter-chip active" : "filter-chip"}
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    aria-pressed={statusFilter === filter}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="vehicle-list">
                {visibleVehicles.length > 0 ? (
                  visibleVehicles.map((vehicle) => (
                    <button
                      className={`vehicle-row ${selectedVehicle === vehicle.id ? "selected" : ""}`}
                      key={vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle.id)}
                    >
                      <span className={`vehicle-avatar ${vehicle.color}`}><Icon name="truck" size={19} /></span>
                      <span className="vehicle-copy">
                        <span className="vehicle-name">{vehicle.name}<span className="vehicle-id">{vehicle.id}</span></span>
                        <span className="vehicle-location"><Icon name="location" size={13} />{vehicle.location}</span>
                      </span>
                      <span className="vehicle-meta">
                        <span className={`vehicle-status ${vehicle.status === "Moving" ? "status-moving" : "status-idle"}`}>
                          <i />{vehicle.status}
                        </span>
                        <span className="vehicle-speed">{vehicle.speed}</span>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="empty-state">
                    <Icon name="search" size={21} />
                    <strong>No vehicles found</strong>
                    <span>Try another search or filter.</span>
                  </div>
                )}
              </div>
              <a className="all-vehicles-link" href="#vehicles">View all 24 vehicles <Icon name="chevron" size={14} /></a>
            </article>
          </section>

          <section className="bottom-grid" id="activity">
            <article className="panel distance-panel">
              <div className="panel-heading">
                <div>
                  <h2>Distance covered</h2>
                  <p>Your fleet&apos;s mileage this week</p>
                </div>
                <button className="period-button">This week <Icon name="arrow-down" size={14} /></button>
              </div>
              <div className="chart-summary">
                <strong>4,862 <span>mi</span></strong>
                <span className="chart-comparison"><i><Icon name="arrow-up" size={12} /></i> 6.4% <span>vs last week</span></span>
              </div>
              <div className="bar-chart" aria-label="Weekly distance chart">
                {weeklyDistance.map(({ day, value }, index) => (
                  <div className="bar-column" key={day}>
                    <span className="bar-tooltip" style={{ bottom: `calc(${value}% + 4px)` }}>
                      {Math.round((value / 100) * 820)} mi
                    </span>
                    <span className={`chart-bar ${index === 3 ? "highlight" : ""}`} style={{ height: `${value}%` }} />
                    <span className={index === 3 ? "chart-day current" : "chart-day"}>{day}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel activity-panel">
              <div className="panel-heading">
                <div>
                  <h2>Recent activity</h2>
                  <p>Latest updates from your fleet</p>
                </div>
                <a className="text-link" href="#activity">See all <Icon name="chevron" size={14} /></a>
              </div>
              <div className="activity-list">
                {activity.map((item) => (
                  <div className="activity-row" key={item.title}>
                    <span className={`activity-icon ${item.tone}`}><Icon name={item.icon} size={16} /></span>
                    <span className="activity-copy">
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </span>
                    <span className="activity-time">{item.time}</span>
                  </div>
                ))}
              </div>
              <div className="activity-footer"><span className="status-dot green-dot" /> Fleet is up to date <span>·</span> <Icon name="clock" size={13} /> Synced 2 min ago</div>
            </article>
          </section>
          <footer className="page-footer">
            <span>© 2026 Trackline. Fleet operations, made clear.</span>
            <span><Icon name="wifi" size={14} /> Connected</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

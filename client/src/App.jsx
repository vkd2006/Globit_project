import { useState, useEffect } from "react";
import {
  LayoutDashboard, Laptop, Users, ClipboardList, Truck, RotateCcw,
  Search, Bell, Plus, ArrowUpRight, Package, Clock, CheckCircle2,
  Menu, X, Globe2, ShieldCheck, ArrowRight, Mail, LockKeyhole,
  Eye, EyeOff, Boxes, MapPin, CircleCheck, Pencil, Trash2, Check,
} from "lucide-react";
import "./App.css";

// Talks to the Express server (Vite forwards /api to localhost:5000)
async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Equipment", icon: Laptop },
  { label: "Employees", icon: Users },
  { label: "Requests", icon: ClipboardList },
  { label: "Shipments", icon: Truck },
  { label: "Returns", icon: RotateCcw },
  { label: "Users", icon: ShieldCheck },
];

const equipmentTypes = ["laptop", "monitor", "phone", "keyboard", "mouse", "headset", "other"];
const statusLabels = {
  available: "Available",
  assigned: "Assigned",
  in_transit: "In transit",
  retired: "Retired",
  active: "Active",
  inactive: "Inactive",
  on_leave: "On leave",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  fulfilled: "Fulfilled",
  processing: "Processing",
  delivered: "Delivered",
  cancelled: "Cancelled",
  requested: "Requested",
  received: "Received",
  completed: "Completed",
};

// How far along each shipment status is (used by the progress bars)
const shipmentProgress = { processing: 25, in_transit: 65, delivered: 100, cancelled: 0 };

const stats = [
  { label: "Total Equipment", value: 0, note: "Registered equipment", icon: Laptop },
  { label: "Active Employees", value: 0, note: "Registered active staff", icon: Users },
  { label: "Pending Requests", value: 0, note: "Awaiting review", icon: Clock },
  { label: "In Transit", value: 0, note: "Active shipments", icon: Truck },
];

function Brand({ light = false }) {
  return (
    <div className={`brand ${light ? "brand-light" : ""}`}>
      <div className="brand-icon"><Package size={23} /></div>
      <span>globit<span className="brand-dot">.</span></span>
    </div>
  );
}

function LandingPage({ onSignIn, onGetStarted }) {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <a className="landing-brand-link" href="#top" aria-label="Globit home"><Brand /></a>
        <nav className="landing-links" aria-label="Main navigation">
          <a href="#solutions">Solutions</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <div className="landing-nav-actions">
          <button className="landing-signin" onClick={onSignIn}>Sign in</button>
          <button className="landing-primary" onClick={onGetStarted}>Get started <ArrowRight size={16} /></button>
        </div>
      </header>

      <main id="top">
        <section className="landing-hero">
          <div className="hero-copy">
            <div className="hero-kicker"><Globe2 size={15} /> GLOBAL EQUIPMENT, SIMPLIFIED</div>
            <h1>Equip your global workforce, <span>anywhere.</span></h1>
            <p className="hero-description">From procurement to delivery and recovery, manage your team's equipment across borders—all in one place.</p>
            <div className="hero-actions">
              <button className="landing-primary hero-cta" onClick={onGetStarted}>Get started <ArrowRight size={17} /></button>
              <button className="landing-secondary" onClick={onSignIn}>Sign in to your workspace</button>
            </div>
            <div className="hero-trust"><span className="trust-icon"><ShieldCheck size={17} /></span><span>One workspace. Every location. Total visibility.</span></div>
          </div>
          <div className="hero-visual" aria-label="Illustration of global equipment logistics">
            <div className="visual-orbit orbit-one"></div><div className="visual-orbit orbit-two"></div>
            <div className="visual-globe"><Globe2 size={90} strokeWidth={1.15} /></div>
            <div className="float-card float-card-top"><span className="float-icon purple"><Laptop size={19} /></span><span><strong>Equipment ready</strong><small>Device management</small></span><CircleCheck className="float-check" size={18} /></div>
            <div className="float-card float-card-bottom"><span className="float-icon green"><Truck size={19} /></span><span><strong>Shipment in transit</strong><small><MapPin size={12} /> Berlin, Germany</small></span><span className="shipment-pulse"></span></div>
            <div className="visual-tag"><span className="tag-dot"></span> Connected worldwide</div>
          </div>
        </section>

        <section className="landing-benefits" id="solutions">
          <div className="benefits-intro"><span className="section-eyebrow">BUILT FOR DISTRIBUTED TEAMS</span><h2>Everything your equipment needs.<br /><span>All in one place.</span></h2><p>Keep every device, delivery, and return moving smoothly—wherever your people work.</p></div>
          <div className="benefit-grid" id="features">
            <article className="benefit-card"><div className="benefit-icon"><Boxes size={22} /></div><h3>Equipment management</h3><p>Keep device details and availability organised in one central workspace.</p><span className="benefit-number">01</span></article>
            <article className="benefit-card"><div className="benefit-icon"><Truck size={22} /></div><h3>Global shipping</h3><p>Follow equipment deliveries and keep shipment information visible.</p><span className="benefit-number">02</span></article>
            <article className="benefit-card"><div className="benefit-icon"><Users size={22} /></div><h3>Employee requests</h3><p>Bring equipment requests and team needs into one clear workflow.</p><span className="benefit-number">03</span></article>
            <article className="benefit-card"><div className="benefit-icon"><RotateCcw size={22} /></div><h3>Easy asset recovery</h3><p>Keep returns and offboarding equipment organised from start to finish.</p><span className="benefit-number">04</span></article>
          </div>
        </section>

        <section className="landing-tracking" id="how-it-works">
          <div className="tracking-copy"><span className="section-eyebrow">VISIBILITY WITHOUT THE CHAOS</span><h2>Know where your equipment is going.</h2><p>Keep shipment details and delivery progress close at hand, with a workspace designed for teams spread around the world.</p><button className="landing-text-link" onClick={onGetStarted}>Explore your workspace <ArrowRight size={16} /></button></div>
          <div className="tracking-preview">
            <div className="tracking-preview-head"><div><span className="preview-eyebrow">SHIPMENT OVERVIEW</span><h3>Delivery activity</h3></div><span className="preview-badge">Live overview</span></div>
            <div className="tracking-route"><div className="route-icon"><Package size={21} /></div><div className="route-details"><strong>Equipment shipment</strong><span>Origin and destination details</span></div><span className="route-status">Ready to track</span></div>
            <div className="route-line"><span></span><span></span><span></span></div>
            <div className="route-stops"><div><span className="stop-dot completed"></span><strong>Prepared</strong><small>Equipment registered</small></div><div><span className="stop-dot"></span><strong>In transit</strong><small>Shipment updates</small></div><div><span className="stop-dot"></span><strong>Delivered</strong><small>Delivery confirmation</small></div></div>
            <div className="preview-note"><ShieldCheck size={16} /> Shipment details will appear here once records are added.</div>
          </div>
        </section>

        <section className="landing-final-cta"><div><span className="section-eyebrow">YOUR GLOBAL EQUIPMENT HUB</span><h2>Make global equipment logistics feel local.</h2><p>Bring your equipment operations together with Globit.</p></div><button className="landing-primary" onClick={onGetStarted}>Get started <ArrowRight size={16} /></button></section>
      </main>
      <footer className="landing-footer"><Brand /><span>© 2026 Globit</span><span>Global equipment. Simplified.</span></footer>
    </div>
  );
}

function SignInPage({ onBack, onSignedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setMessage("Enter your email and password to continue.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const { user } = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      onSignedIn(user);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signin-page">
      <header className="signin-nav"><button className="landing-brand-link" onClick={onBack} aria-label="Back to home"><Brand /></button><button className="signin-back" onClick={onBack}>← Back to home</button></header>
      <main className="signin-main">
        <section className="signin-card">
          <div className="signin-mark"><Package size={26} /></div>
          <span className="section-eyebrow">WELCOME BACK</span>
          <h1>Sign in to Globit</h1>
          <p className="signin-intro">Access your global equipment workspace.</p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="globit-email">Email address</label>
            <div className="signin-input-wrap"><Mail size={18} /><input id="globit-email" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <label htmlFor="globit-password">Password</label>
            <div className="signin-input-wrap"><LockKeyhole size={18} /><input id="globit-password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" className="password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
            <button className="landing-primary signin-submit" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"} <ArrowRight size={17} /></button>
            {message && <p className="signin-message" role="status">{message}</p>}
          </form>
          <div className="signin-security"><ShieldCheck size={16} /> Your workspace, all in one place.</div>
        </section>
      </main>
      <footer className="signin-footer">© 2026 Globit · Global equipment. Simplified.</footer>
    </div>
  );
}

function AddEquipmentModal({ onClose, onAdded, employees = [] }) {
  const [form, setForm] = useState({
    name: "",
    type: "laptop",
    serialNumber: "",
    country: "",
    notes: "",
    assignedTo: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        assignedTo: form.assignedTo || null,
        status: form.assignedTo ? "assigned" : "available",
      };
      const { item } = await api("/equipment", { method: "POST", body: JSON.stringify(payload) });
      onAdded(item);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Add equipment" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Add equipment</h2><p>Register a new device in your workspace.</p></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="eq-name">Name</label>
            <input id="eq-name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. MacBook Pro 14" required />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="eq-type">Type</label>
              <select id="eq-type" value={form.type} onChange={(e) => update("type", e.target.value)}>
                {equipmentTypes.map((type) => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="eq-country">Country</label>
              <input id="eq-country" value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="e.g. India" />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="eq-serial">Serial number</label>
            <input id="eq-serial" value={form.serialNumber} onChange={(e) => update("serialNumber", e.target.value)} placeholder="e.g. C02XK1ABJG5H" required />
          </div>
          <div className="form-field">
            <label htmlFor="eq-assigned">Assign to employee (optional)</label>
            <select id="eq-assigned" value={form.assignedTo} onChange={(e) => update("assignedTo", e.target.value)}>
              <option value="">Unassigned (Available)</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} {emp.department ? `(${emp.department})` : ""} — {emp.email}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="eq-notes">Notes (optional)</label>
            <textarea id="eq-notes" value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Anything worth remembering" />
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving..." : "Add equipment"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditEquipmentModal({ item, employees = [], onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: item.name || "",
    type: item.type || "laptop",
    serialNumber: item.serialNumber || "",
    country: item.country || "",
    notes: item.notes || "",
    status: item.status || "available",
    assignedTo: item.assignedTo?._id || item.assignedTo || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "assignedTo") {
        if (value) {
          next.status = "assigned";
        } else if (current.status === "assigned") {
          next.status = "available";
        }
      }
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        assignedTo: form.assignedTo || null,
      };
      const { item: updated } = await api(`/equipment/${item._id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      onUpdated(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Edit equipment" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Edit equipment</h2><p>Update device details and employee assignment.</p></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="edit-eq-name">Name</label>
            <input id="edit-eq-name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="edit-eq-type">Type</label>
              <select id="edit-eq-type" value={form.type} onChange={(e) => update("type", e.target.value)}>
                {equipmentTypes.map((type) => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="edit-eq-country">Country</label>
              <input id="edit-eq-country" value={form.country} onChange={(e) => update("country", e.target.value)} />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="edit-eq-serial">Serial number</label>
            <input id="edit-eq-serial" value={form.serialNumber} onChange={(e) => update("serialNumber", e.target.value)} required />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="edit-eq-assigned">Assign to employee</label>
              <select id="edit-eq-assigned" value={form.assignedTo} onChange={(e) => update("assignedTo", e.target.value)}>
                <option value="">Unassigned</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} {emp.department ? `(${emp.department})` : ""} — {emp.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="edit-eq-status">Status</label>
              <select id="edit-eq-status" value={form.status} onChange={(e) => update("status", e.target.value)}>
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="in_transit">In transit</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="edit-eq-notes">Notes (optional)</label>
            <textarea id="edit-eq-notes" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EquipmentTable({ items, loading, search, role, onClearSearch, onAdd, onRequestReturn, onEdit, onDelete }) {
  const isEmployee = role === "employee";
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>{isEmployee ? "My devices" : "All equipment"}</h2>
          <p>{isEmployee ? "Equipment and accessories currently assigned to you" : "Every device registered in your workspace"}</p>
        </div>
        {!isEmployee && <button className="text-button" onClick={onAdd}>Add equipment <Plus size={15} /></button>}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>NAME</th>
              <th>TYPE</th>
              <th>SERIAL NUMBER</th>
              <th>COUNTRY</th>
              {!isEmployee && <th>ASSIGNED TO</th>}
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isEmployee ? 6 : 7} className="empty-state">Loading equipment...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={isEmployee ? 6 : 7} className="empty-state">{search ? "No matching equipment found." : isEmployee ? "No equipment currently assigned to you. Submit a device request to get hardware." : "No equipment yet. Add your first item with the button above."}</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item._id}>
                  <td className="cell-strong">{item.name}</td>
                  <td className="cell-capitalize">{item.type}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{item.serialNumber}</td>
                  <td>{item.country || "—"}</td>
                  {!isEmployee && (
                    <td>
                      {item.assignedTo ? (
                        <div className="assignee-badge" title={`${item.assignedTo.name} (${item.assignedTo.email || ""})`}>
                          <span className="assignee-avatar">
                            {item.assignedTo.name?.[0]?.toUpperCase() || "E"}
                          </span>
                          <span>{item.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="cell-muted">—</span>
                      )}
                    </td>
                  )}
                  <td><span className={`status-badge status-${item.status}`}>{statusLabels[item.status] || item.status}</span></td>
                  <td>
                    <div className="table-actions">
                      {!isEmployee ? (
                        <>
                          <button className="action-btn" title="Edit / Assign equipment" aria-label="Edit equipment" onClick={() => onEdit(item)}>
                            <Pencil size={14} />
                          </button>
                          <button className="action-btn action-btn-danger" title="Delete equipment" aria-label="Delete equipment" onClick={() => onDelete(item)}>
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          className="action-btn"
                          title="Request return for this device"
                          aria-label="Request return"
                          onClick={() => onRequestReturn(item)}
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="panel-footer"><span>{items.length} items</span><button onClick={onClearSearch}>Clear search</button></div>
    </section>
  );
}

function AddEmployeeModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    country: "",
    address: "",
    status: "active",
    password: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { employee } = await api("/employees", {
        method: "POST",
        body: JSON.stringify(form),
      });
      onAdded(employee);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Add employee" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Add employee</h2><p>Register a team member in your organization.</p></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="emp-name">Full name</label>
            <input id="emp-name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Priya Sharma" required />
          </div>
          <div className="form-field">
            <label htmlFor="emp-email">Email address</label>
            <input id="emp-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="e.g. priya@company.com" required />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="emp-dept">Department</label>
              <input id="emp-dept" value={form.department} onChange={(e) => update("department", e.target.value)} placeholder="e.g. Engineering" />
            </div>
            <div className="form-field">
              <label htmlFor="emp-country">Country</label>
              <input id="emp-country" value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="e.g. India" />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="emp-address">Address / Location</label>
            <input id="emp-address" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="e.g. Gurgaon, Haryana" />
          </div>
          <div className="form-field">
            <label htmlFor="emp-status">Status</label>
            <select id="emp-status" value={form.status} onChange={(e) => update("status", e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On leave</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="emp-password">Sign-in password (optional)</label>
            <input
              id="emp-password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="e.g. Employee@123 (defaults to Employee@123)"
              minLength={8}
            />
            <span className="cell-muted">A sign-in user account will be created so this employee can log in and request devices.</span>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving..." : "Add employee"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditEmployeeModal({ employee, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: employee.name || "",
    email: employee.email || "",
    department: employee.department || "",
    country: employee.country || "",
    address: employee.address || "",
    status: employee.status || "active",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { employee: updated } = await api(`/employees/${employee._id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      onUpdated(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Edit employee" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Edit employee</h2><p>Update employee profile and details.</p></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="edit-emp-name">Full name</label>
            <input id="edit-emp-name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </div>
          <div className="form-field">
            <label htmlFor="edit-emp-email">Email address</label>
            <input id="edit-emp-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="edit-emp-dept">Department</label>
              <input id="edit-emp-dept" value={form.department} onChange={(e) => update("department", e.target.value)} />
            </div>
            <div className="form-field">
              <label htmlFor="edit-emp-country">Country</label>
              <input id="edit-emp-country" value={form.country} onChange={(e) => update("country", e.target.value)} />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="edit-emp-address">Address / Location</label>
            <input id="edit-emp-address" value={form.address} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="edit-emp-status">Status</label>
            <select id="edit-emp-status" value={form.status} onChange={(e) => update("status", e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On leave</option>
            </select>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddRequestModal({ employees = [], currentUser = null, onClose, onAdded }) {
  const isEmployee = currentUser?.role === "employee";
  const [form, setForm] = useState({
    employee: isEmployee ? "" : (employees[0]?._id || ""),
    equipment: "",
    item: "",
    itemType: "laptop",
    reason: "",
    status: "pending",
  });
  const [availableItems, setAvailableItems] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    api("/equipment?status=available")
      .then(({ items }) => {
        if (!ignore) {
          setAvailableItems(items || []);
          setLoadingAvailable(false);
        }
      })
      .catch(() => {
        if (!ignore) setLoadingAvailable(false);
      });
    return () => { ignore = true; };
  }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSelectAvailable(equipmentId) {
    if (!equipmentId) {
      setForm((curr) => ({ ...curr, equipment: "", item: "", itemType: "laptop" }));
      return;
    }
    const found = availableItems.find((eq) => eq._id === equipmentId);
    if (found) {
      setForm((curr) => ({
        ...curr,
        equipment: found._id,
        item: found.name,
        itemType: found.type,
      }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isEmployee && !form.employee) {
      setError("Please select an employee.");
      return;
    }
    if (!form.item) {
      setError("Please select an available device or enter an item name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = isEmployee
        ? { equipment: form.equipment || null, item: form.item, itemType: form.itemType, reason: form.reason }
        : form;
      const { request } = await api("/requests", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      onAdded(request);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Add equipment request" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{isEmployee ? "Request available equipment" : "New equipment request"}</h2>
            <p>{isEmployee ? "Select from available equipment inventory to request for your work." : "Submit an equipment request on behalf of an employee."}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          {isEmployee ? (
            <div style={{ background: "#f8f9ff", border: "1px solid #e0e7ff", borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px", color: "#4338ca", fontSize: "13px" }}>
              <Package size={18} />
              <span>Requesting for: <strong>{currentUser.name}</strong> ({currentUser.email})</span>
            </div>
          ) : (
            <div className="form-field">
              <label htmlFor="req-emp">Employee</label>
              <select id="req-emp" value={form.employee} onChange={(e) => update("employee", e.target.value)} required>
                <option value="">Select employee...</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.department || "No department"}) — {emp.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-field">
            <label htmlFor="req-select-avail">Select available device from inventory</label>
            <select
              id="req-select-avail"
              value={form.equipment}
              onChange={(e) => handleSelectAvailable(e.target.value)}
            >
              <option value="">
                {loadingAvailable ? "Loading available inventory..." : availableItems.length === 0 ? "No available equipment in stock" : "Choose an available device..."}
              </option>
              {availableItems.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name} ({item.type.toUpperCase()}) — SN: {item.serialNumber} {item.country ? `· ${item.country}` : ""}
                </option>
              ))}
            </select>
            {form.equipment && (
              <span className="cell-muted" style={{ fontSize: "12px", color: "#16a34a" }}>
                ✓ Selected equipment will be automatically assigned to you when approved by admin.
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="req-item">Equipment / Item name</label>
            <input id="req-item" value={form.item} onChange={(e) => update("item", e.target.value)} placeholder="e.g. MacBook Pro 16 or Dell 27 4K Monitor" required />
          </div>
          <div className="form-field">
            <label htmlFor="req-type">Item category</label>
            <select id="req-type" value={form.itemType} onChange={(e) => update("itemType", e.target.value)}>
              {equipmentTypes.map((type) => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="req-reason">Reason / Justification (optional)</label>
            <textarea id="req-reason" value={form.reason} onChange={(e) => update("reason", e.target.value)} placeholder="Why is this equipment needed?" />
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? "Submitting..." : "Submit request"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RequestsTable({ requests, loading, search, role, onClearSearch, onAdd, onUpdateStatus, onDelete }) {
  const isEmployee = role === "employee";
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>{isEmployee ? "My requests" : "All requests"}</h2>
          <p>{isEmployee ? "Equipment requests submitted by you and their live approval status" : "Equipment requests submitted by team members"}</p>
        </div>
        <button className="text-button" onClick={onAdd}>{isEmployee ? "Request device" : "Add request"} <Plus size={15} /></button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {!isEmployee && <th>EMPLOYEE</th>}
              <th>REQUESTED ITEM</th>
              <th>TYPE</th>
              <th>DATE</th>
              <th>REASON</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isEmployee ? 6 : 7} className="empty-state">Loading requests...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={isEmployee ? 6 : 7} className="empty-state">{search ? "No matching requests found." : isEmployee ? "You haven't requested any devices yet. Click 'Request device' above to choose from available inventory." : "No requests yet. Submit your first request with the button above."}</td></tr>
            ) : (
              requests.map((req) => (
                <tr key={req._id}>
                  {!isEmployee && (
                    <td>
                      <div className="employee-cell">
                        <span className="employee-avatar">
                          {req.employee?.name?.[0]?.toUpperCase() || "E"}
                        </span>
                        <div className="employee-info-cell">
                          <strong>{req.employee?.name || "Unknown employee"}</strong>
                          <span>{req.employee?.department || req.employee?.email || "—"}</span>
                        </div>
                      </div>
                    </td>
                  )}
                  <td>
                    <span className="cell-strong">{req.item}</span>
                    {req.equipment?.serialNumber && (
                      <span className="cell-muted" style={{ fontSize: "11px", display: "block", fontFamily: "monospace" }}>
                        SN: {req.equipment.serialNumber}
                      </span>
                    )}
                  </td>
                  <td className="cell-capitalize">{req.itemType || "laptop"}</td>
                  <td>{req.date || "—"}</td>
                  <td style={{ maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={req.reason}>
                    {req.reason || "—"}
                  </td>
                  <td>
                    <span className={`status-badge status-${req.status}`}>
                      {statusLabels[req.status] || req.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      {!isEmployee && req.status === "pending" && (
                        <>
                          <button
                            className="action-btn action-btn-success"
                            title="Approve & Assign equipment to employee"
                            aria-label="Approve request"
                            onClick={() => onUpdateStatus(req._id, "approved")}
                          >
                            <Check size={14} />
                          </button>
                          <button
                            className="action-btn action-btn-danger"
                            title="Reject request"
                            aria-label="Reject request"
                            onClick={() => onUpdateStatus(req._id, "rejected")}
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}
                      {!isEmployee && (
                        <button
                          className="action-btn action-btn-danger"
                          title="Delete request"
                          aria-label="Delete request"
                          onClick={() => onDelete(req)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      {isEmployee && (
                        <span className="cell-muted" style={{ fontSize: "12px" }}>
                          {req.status === "pending" ? "Awaiting review" : req.status === "approved" ? "Approved & Assigned" : req.status === "rejected" ? "Declined" : "Fulfilled"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="panel-footer">
        <span>{requests.length} requests</span>
        <button onClick={onClearSearch}>Clear search</button>
      </div>
    </section>
  );
}

function AddShipmentModal({ equipment = [], employees = [], onClose, onAdded }) {
  // Only items that are free to ship (not already on the road, not retired)
  const shippable = equipment.filter((item) => item.status === "available" || item.status === "assigned");
  const recipients = employees.filter((emp) => emp.status === "active");
  const [form, setForm] = useState({
    equipment: "",
    employee: "",
    carrier: "",
    trackingNumber: "",
    destinationCountry: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      // Suggest the employee's country as the destination
      if (field === "employee" && !current.destinationCountry) {
        const chosen = employees.find((emp) => emp._id === value);
        if (chosen?.country) next.destinationCountry = chosen.country;
      }
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.equipment || !form.employee) {
      setError("Choose the equipment and the employee.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const { shipment } = await api("/shipments", { method: "POST", body: JSON.stringify(form) });
      onAdded(shipment);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Add shipment" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>New shipment</h2><p>Send a device to an employee and track it until it arrives.</p></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="ship-equipment">Equipment</label>
            <select id="ship-equipment" value={form.equipment} onChange={(e) => update("equipment", e.target.value)} required>
              <option value="">Select equipment...</option>
              {shippable.map((item) => (
                <option key={item._id} value={item._id}>{item.name} — {item.serialNumber}</option>
              ))}
            </select>
            {shippable.length === 0 && <span className="cell-muted">No equipment is free to ship right now.</span>}
          </div>
          <div className="form-field">
            <label htmlFor="ship-employee">Send to employee</label>
            <select id="ship-employee" value={form.employee} onChange={(e) => update("employee", e.target.value)} required>
              <option value="">Select employee...</option>
              {recipients.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} {emp.country ? `(${emp.country})` : ""} — {emp.email}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="ship-carrier">Carrier (optional)</label>
              <input id="ship-carrier" value={form.carrier} onChange={(e) => update("carrier", e.target.value)} placeholder="e.g. DHL" />
            </div>
            <div className="form-field">
              <label htmlFor="ship-tracking">Tracking number (optional)</label>
              <input id="ship-tracking" value={form.trackingNumber} onChange={(e) => update("trackingNumber", e.target.value)} placeholder="e.g. 1Z999AA10123456784" />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="ship-country">Destination country</label>
            <input id="ship-country" value={form.destinationCountry} onChange={(e) => update("destinationCountry", e.target.value)} placeholder="e.g. India" />
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? "Creating..." : "Create shipment"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ShipmentsTable({ shipments, loading, search, role, onClearSearch, onAdd, onTrack, onStatus, onDelete }) {
  const canManage = role === "admin" || role === "manager";
  const canDelete = role === "admin";

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>{canManage ? "All shipments" : "My shipments"}</h2>
          <p>{canManage ? "Equipment on its way to your team, worldwide" : "Equipment packages currently in transit to your location"}</p>
        </div>
        {canManage && <button className="text-button" onClick={onAdd}>Add shipment <Plus size={15} /></button>}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>EQUIPMENT</th>
              {canManage && <th>EMPLOYEE</th>}
              <th>DESTINATION</th>
              <th>CARRIER</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={canManage ? 6 : 5} className="empty-state">Loading shipments...</td></tr>
            ) : shipments.length === 0 ? (
              <tr><td colSpan={canManage ? 6 : 5} className="empty-state">{search ? "No matching shipments found." : canManage ? "No shipments yet. Create your first shipment with the button above." : "No shipments currently in transit to you."}</td></tr>
            ) : (
              shipments.map((shipment) => {
                const open = shipment.status === "processing" || shipment.status === "in_transit";
                return (
                  <tr key={shipment._id}>
                    <td>
                      <div className="employee-info-cell">
                        <strong>{shipment.equipment?.name || "Equipment"}</strong>
                        <span>{shipment.equipment?.serialNumber || "—"}</span>
                      </div>
                    </td>
                    {canManage && (
                      <td>
                        <div className="assignee-badge">
                          <span className="assignee-avatar">{shipment.employee?.name?.[0]?.toUpperCase() || "E"}</span>
                          <span>{shipment.employee?.name || "Removed employee"}</span>
                        </div>
                      </td>
                    )}
                    <td>{shipment.destinationCountry || "—"}</td>
                    <td>
                      <div className="employee-info-cell">
                        <strong>{shipment.carrier || "—"}</strong>
                        <span>{shipment.trackingNumber || ""}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${shipment.status}`}>
                        {statusLabels[shipment.status] || shipment.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn" title="View tracking timeline" aria-label="View tracking" onClick={() => onTrack(shipment)}>
                          <MapPin size={14} />
                        </button>
                        {canManage && shipment.status === "processing" && (
                          <button className="action-btn" title="Mark as in transit" aria-label="Mark as in transit" onClick={() => onStatus(shipment._id, "in_transit")}>
                            <Truck size={14} />
                          </button>
                        )}
                        {canManage && shipment.status === "in_transit" && (
                          <button className="action-btn action-btn-success" title="Mark as delivered" aria-label="Mark as delivered" onClick={() => onStatus(shipment._id, "delivered")}>
                            <Check size={14} />
                          </button>
                        )}
                        {canManage && open && (
                          <button className="action-btn action-btn-danger" title="Cancel shipment" aria-label="Cancel shipment" onClick={() => onStatus(shipment._id, "cancelled", "Shipment cancelled")}>
                            <X size={14} />
                          </button>
                        )}
                        {canDelete && !open && (
                          <button className="action-btn action-btn-danger" title="Delete shipment record" aria-label="Delete shipment" onClick={() => onDelete(shipment)}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="panel-footer"><span>{shipments.length} shipments</span><button onClick={onClearSearch}>Clear search</button></div>
    </section>
  );
}

function TrackingModal({ shipment, onClose }) {
  const progress = shipmentProgress[shipment.status] ?? 0;
  const steps = shipment.timeline || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Shipment tracking" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{shipment.equipment?.name || "Removed equipment"}</h2>
            <p>
              To {shipment.employee?.name || "removed employee"}
              {shipment.destinationCountry ? ` · ${shipment.destinationCountry}` : ""}
            </p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="tracking-summary">
          <span className={`status-badge status-${shipment.status}`}>{statusLabels[shipment.status] || shipment.status}</span>
          <span className="cell-muted">
            {shipment.carrier || "No carrier"}{shipment.trackingNumber ? ` · ${shipment.trackingNumber}` : ""}
          </span>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        <ol className="timeline">
          {steps.map((step, index) => (
            <li className="timeline-item" key={`${step.status}-${index}`}>
              <span className="timeline-dot" />
              <div className="timeline-body">
                <strong>{statusLabels[step.status] || step.status}</strong>
                {step.note && <p>{step.note}</p>}
                <small>{step.at ? new Date(step.at).toLocaleString() : ""}</small>
              </div>
            </li>
          ))}
        </ol>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function AddReturnModal({ equipment = [], onClose, onAdded }) {
  // Only devices currently assigned to someone can come back
  const returnable = equipment.filter((item) => item.status === "assigned" && item.assignedTo);
  const [form, setForm] = useState({ equipment: "", reason: "", condition: "good" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.equipment) {
      setError("Choose the equipment that is being returned.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const { equipmentReturn } = await api("/returns", { method: "POST", body: JSON.stringify(form) });
      onAdded(equipmentReturn);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Add return" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>New return</h2><p>Record a device that is coming back from an employee.</p></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="ret-equipment">Equipment</label>
            <select id="ret-equipment" value={form.equipment} onChange={(e) => update("equipment", e.target.value)} required>
              <option value="">Select equipment...</option>
              {returnable.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name} — {item.assignedTo?.name || "assigned employee"}
                </option>
              ))}
            </select>
            {returnable.length === 0 && <span className="cell-muted">No equipment is assigned to an employee right now.</span>}
          </div>
          <div className="form-field">
            <label htmlFor="ret-condition">Expected condition</label>
            <select id="ret-condition" value={form.condition} onChange={(e) => update("condition", e.target.value)}>
              <option value="good">Good</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="ret-reason">Reason (optional)</label>
            <textarea id="ret-reason" value={form.reason} onChange={(e) => update("reason", e.target.value)} placeholder="e.g. Employee is leaving the company" />
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving..." : "Create return"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CompleteReturnModal({ item, onClose, onSubmit }) {
  const [condition, setCondition] = useState(item.condition || "good");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    const ok = await onSubmit(item._id, { condition, notes });
    setSaving(false);
    if (ok) onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-small" role="dialog" aria-modal="true" aria-label="Complete return" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Inspect and complete</h2><p>{item.equipment?.name || "This device"} will go back to stock, or be retired if damaged.</p></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="done-condition">Condition after inspection</label>
            <select id="done-condition" value={condition} onChange={(e) => setCondition(e.target.value)}>
              <option value="good">Good (back to Available)</option>
              <option value="damaged">Damaged (Retired)</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="done-notes">Notes (optional)</label>
            <textarea id="done-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything worth recording about the inspection" />
          </div>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving..." : "Complete return"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReturnsTable({ returns, loading, search, role, onClearSearch, onAdd, onReceive, onComplete, onCancel, onDelete }) {
  const canManage = role === "admin" || role === "manager";
  const canDelete = role === "admin";

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>{canManage ? "All returns" : "My returns"}</h2>
          <p>{canManage ? "Devices coming back from your team" : "Equipment returned or scheduled for recovery"}</p>
        </div>
        {canManage && <button className="text-button" onClick={onAdd}>Add return <Plus size={15} /></button>}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>EQUIPMENT</th>
              {canManage && <th>EMPLOYEE</th>}
              <th>REASON</th>
              <th>CONDITION</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={canManage ? 6 : 5} className="empty-state">Loading returns...</td></tr>
            ) : returns.length === 0 ? (
              <tr><td colSpan={canManage ? 6 : 5} className="empty-state">{search ? "No matching returns found." : canManage ? "No returns yet. Record your first return with the button above." : "No return records."}</td></tr>
            ) : (
              returns.map((item) => {
                const open = item.status === "requested" || item.status === "received";
                return (
                  <tr key={item._id}>
                    <td>
                      <div className="employee-info-cell">
                        <strong>{item.equipment?.name || "Removed equipment"}</strong>
                        <span>{item.equipment?.serialNumber || "—"}</span>
                      </div>
                    </td>
                    {canManage && (
                      <td>
                        <div className="assignee-badge">
                          <span className="assignee-avatar">{item.employee?.name?.[0]?.toUpperCase() || "E"}</span>
                          <span>{item.employee?.name || "Removed employee"}</span>
                        </div>
                      </td>
                    )}
                    <td style={{ maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.reason}>
                      {item.reason || "—"}
                    </td>
                    <td className="cell-capitalize">{item.condition}</td>
                    <td>
                      <span className={`status-badge status-${item.status}`}>
                        {statusLabels[item.status] || item.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        {canManage && item.status === "requested" && (
                          <button className="action-btn" title="Mark as received" aria-label="Mark as received" onClick={() => onReceive(item._id)}>
                            <Package size={14} />
                          </button>
                        )}
                        {canManage && item.status === "received" && (
                          <button className="action-btn action-btn-success" title="Inspect and complete" aria-label="Inspect and complete" onClick={() => onComplete(item)}>
                            <Check size={14} />
                          </button>
                        )}
                        {canManage && open && (
                          <button className="action-btn action-btn-danger" title="Cancel return" aria-label="Cancel return" onClick={() => onCancel(item._id)}>
                            <X size={14} />
                          </button>
                        )}
                        {canDelete && !open && (
                          <button className="action-btn action-btn-danger" title="Delete return" aria-label="Delete return" onClick={() => onDelete(item)}>
                            <Trash2 size={14} />
                          </button>
                        )}
                        {!canManage && (
                          <span className="cell-muted" style={{ fontSize: "12px" }}>
                            {item.status === "completed" ? "Completed" : item.status === "received" ? "Under inspection" : "Pending pickup"}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="panel-footer"><span>{returns.length} returns</span><button onClick={onClearSearch}>Clear search</button></div>
    </section>
  );
}

const roleOptions = ["admin", "manager", "employee"];

function AddUserModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: "", email: "", role: "employee", password: "", department: "", country: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { user: created } = await api("/users", { method: "POST", body: JSON.stringify(form) });
      onAdded(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Add user" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Add user</h2><p>Create a sign-in account for a team member.</p></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="user-name">Full name</label>
            <input id="user-name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Priya Sharma" required />
          </div>
          <div className="form-field">
            <label htmlFor="user-email">Email address</label>
            <input id="user-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="e.g. priya@company.com" required />
          </div>
          <div className="form-field">
            <label htmlFor="user-role">Role</label>
            <select id="user-role" value={form.role} onChange={(e) => update("role", e.target.value)}>
              {roleOptions.map((role) => <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>)}
            </select>
          </div>
          {form.role === "employee" && (
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="user-dept">Department (optional)</label>
                <input id="user-dept" value={form.department || ""} onChange={(e) => update("department", e.target.value)} placeholder="e.g. Engineering" />
              </div>
              <div className="form-field">
                <label htmlFor="user-country">Country (optional)</label>
                <input id="user-country" value={form.country || ""} onChange={(e) => update("country", e.target.value)} placeholder="e.g. India" />
              </div>
            </div>
          )}
          <div className="form-field">
            <label htmlFor="user-password">Temporary password</label>
            <input id="user-password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="At least 8 characters" minLength={8} required />
            <span className="cell-muted">
              {form.role === "employee" ? "This creates a sign-in account and automatically registers them in the employee directory." : "Share it privately. The user can change it after signing in."}
            </span>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? "Creating..." : "Create user"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({ item, isSelf, onClose, onSaved }) {
  const [form, setForm] = useState({ name: item.name || "", role: item.role, active: item.active !== false });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { user: updated } = await api(`/users/${item.id}`, { method: "PATCH", body: JSON.stringify(form) });
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Edit user" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Edit user</h2><p>{item.email}</p></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="edit-user-name">Full name</label>
            <input id="edit-user-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="edit-user-role">Role</label>
              <select id="edit-user-role" value={form.role} disabled={isSelf} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {roleOptions.map((role) => <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="edit-user-active">Account</label>
              <select id="edit-user-active" value={form.active ? "active" : "inactive"} disabled={isSelf} onChange={(e) => setForm({ ...form, active: e.target.value === "active" })}>
                <option value="active">Active</option>
                <option value="inactive">Deactivated</option>
              </select>
            </div>
          </div>
          {isSelf && <span className="cell-muted">You cannot change your own role or deactivate your own account.</span>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordModal({ item, onClose }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api(`/users/${item.id}/password`, { method: "PATCH", body: JSON.stringify({ password }) });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-small" role="dialog" aria-modal="true" aria-label="Reset password" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Reset password</h2><p>Set a new temporary password for {item.name}.</p></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {done ? (
          <>
            <p className="signin-message" role="status">Password updated. Share the new password with {item.name} privately.</p>
            <div className="modal-actions"><button type="button" className="primary-button" onClick={onClose}>Done</button></div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="reset-password">New password</label>
              <input id="reset-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required />
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
              <button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving..." : "Reset password"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.newPassword !== form.confirm) {
      setError("The new passwords do not match.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-small" role="dialog" aria-modal="true" aria-label="Change password" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Change password</h2><p>Choose a new password for your account.</p></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {done ? (
          <>
            <p className="signin-message" role="status">Your password has been updated.</p>
            <div className="modal-actions"><button type="button" className="primary-button" onClick={onClose}>Done</button></div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="cp-current">Current password</label>
              <input id="cp-current" type="password" autoComplete="current-password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required />
            </div>
            <div className="form-field">
              <label htmlFor="cp-new">New password</label>
              <input id="cp-new" type="password" autoComplete="new-password" minLength={8} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} placeholder="At least 8 characters" required />
            </div>
            <div className="form-field">
              <label htmlFor="cp-confirm">Confirm new password</label>
              <input id="cp-confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
              <button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving..." : "Update password"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function UsersTable({ users, loading, search, currentUserId, onClearSearch, onAdd, onEdit, onReset }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div><h2>All users</h2><p>People who can sign in to Globit, and what they can do</p></div>
        <button className="text-button" onClick={onAdd}>Add user <Plus size={15} /></button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>USER</th>
              <th>EMAIL</th>
              <th>ROLE</th>
              <th>ACCOUNT</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="empty-state">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" className="empty-state">{search ? "No matching users found." : "No users yet."}</td></tr>
            ) : (
              users.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="employee-cell">
                      <span className="employee-avatar">{item.name?.[0]?.toUpperCase() || "U"}</span>
                      <span className="cell-strong">{item.name}{item.id === currentUserId ? " (you)" : ""}</span>
                    </div>
                  </td>
                  <td>{item.email}</td>
                  <td><span className={`status-badge role-${item.role}`}>{item.role}</span></td>
                  <td>
                    <span className={`status-badge status-${item.active ? "active" : "inactive"}`}>
                      {item.active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn" title="Edit user" aria-label="Edit user" onClick={() => onEdit(item)}>
                        <Pencil size={14} />
                      </button>
                      <button className="action-btn" title="Reset password" aria-label="Reset password" onClick={() => onReset(item)}>
                        <LockKeyhole size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="panel-footer">
        <span>{users.length} users</span>
        <button onClick={onClearSearch}>Clear search</button>
      </div>
    </section>
  );
}

function DeleteConfirmModal({ title, message, itemName, onClose, onConfirm, loading }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>{title}</h2><p>This action cannot be undone.</p></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <p className="modal-confirm-text">
          {message} {itemName && <strong>"{itemName}"</strong>}?
        </p>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" className="danger-button" onClick={onConfirm} disabled={loading}>{loading ? "Deleting..." : "Delete"}</button>
        </div>
      </div>
    </div>
  );
}

function EmployeeDetailsModal({ employee, onClose, onUpdateRequestStatus }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    if (!employee?._id) return;
    api(`/employees/${employee._id}`)
      .then((data) => {
        if (!ignore) {
          setDetails(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          alert(err.message || "Failed to load employee records");
          setLoading(false);
        }
      });
    return () => { ignore = true; };
  }, [employee?._id]);

  if (!employee) return null;

  const assigned = details?.assignedEquipment || [];
  const reqs = details?.requests || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" role="dialog" aria-modal="true" aria-label="Employee records" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px" }}>
        <div className="modal-head">
          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <span className="employee-avatar" style={{ width: "42px", height: "42px", fontSize: "16px" }}>
              {employee.name?.[0]?.toUpperCase() || "E"}
            </span>
            <div>
              <h2 style={{ fontSize: "18px", margin: 0 }}>{employee.name}</h2>
              <p style={{ margin: "3px 0 0" }}>{employee.email} · {employee.department || "No department"} · {employee.country || "No location"}</p>
            </div>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        {loading ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#8790a3" }}>Loading employee records...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              <div style={{ background: "#f8f9fc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Assigned Devices</span>
                <strong style={{ display: "block", fontSize: "20px", color: "#1e293b", marginTop: "4px" }}>{assigned.length}</strong>
              </div>
              <div style={{ background: "#f8f9fc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Total Requests</span>
                <strong style={{ display: "block", fontSize: "20px", color: "#1e293b", marginTop: "4px" }}>{reqs.length}</strong>
              </div>
              <div style={{ background: "#f8f9fc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Login Account</span>
                <span className={`status-badge status-${details?.userAccount ? "active" : "inactive"}`} style={{ display: "inline-block", marginTop: "6px" }}>
                  {details?.userAccount ? "Active Account" : "No Login"}
                </span>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <strong style={{ fontSize: "14px", color: "#1e293b" }}>Assigned Devices ({assigned.length})</strong>
              </div>
              {assigned.length === 0 ? (
                <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", fontSize: "13px", color: "#64748b", textAlign: "center" }}>
                  No devices currently assigned to this employee.
                </div>
              ) : (
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                        <th style={{ padding: "8px 12px" }}>DEVICE</th>
                        <th style={{ padding: "8px 12px" }}>TYPE</th>
                        <th style={{ padding: "8px 12px" }}>SERIAL</th>
                        <th style={{ padding: "8px 12px" }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assigned.map((item) => (
                        <tr key={item._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 12px", fontWeight: 600 }}>{item.name}</td>
                          <td style={{ padding: "8px 12px", textTransform: "capitalize" }}>{item.type}</td>
                          <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: "12px" }}>{item.serialNumber}</td>
                          <td style={{ padding: "8px 12px" }}>
                            <span className={`status-badge status-${item.status}`}>{statusLabels[item.status] || item.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <strong style={{ fontSize: "14px", color: "#1e293b" }}>Equipment Requests ({reqs.length})</strong>
              </div>
              {reqs.length === 0 ? (
                <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", fontSize: "13px", color: "#64748b", textAlign: "center" }}>
                  No equipment requests submitted by this employee.
                </div>
              ) : (
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                        <th style={{ padding: "8px 12px" }}>REQUESTED ITEM</th>
                        <th style={{ padding: "8px 12px" }}>CATEGORY</th>
                        <th style={{ padding: "8px 12px" }}>DATE</th>
                        <th style={{ padding: "8px 12px" }}>STATUS</th>
                        <th style={{ padding: "8px 12px" }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reqs.map((r) => (
                        <tr key={r._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                            {r.item}
                            {r.reason && <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 400 }}>{r.reason}</div>}
                          </td>
                          <td style={{ padding: "8px 12px", textTransform: "capitalize" }}>{r.itemType || "laptop"}</td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#64748b" }}>{r.date || "—"}</td>
                          <td style={{ padding: "8px 12px" }}>
                            <span className={`status-badge status-${r.status}`}>{statusLabels[r.status] || r.status}</span>
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            {r.status === "pending" ? (
                              <div style={{ display: "flex", gap: "6px" }}>
                                <button
                                  className="action-btn action-btn-success"
                                  title="Approve"
                                  onClick={async () => {
                                    await onUpdateRequestStatus(r._id, "approved");
                                    const updatedData = await api(`/employees/${employee._id}`);
                                    setDetails(updatedData);
                                  }}
                                >
                                  <Check size={13} />
                                </button>
                                <button
                                  className="action-btn action-btn-danger"
                                  title="Reject"
                                  onClick={async () => {
                                    await onUpdateRequestStatus(r._id, "rejected");
                                    setDetails((d) => ({
                                      ...d,
                                      requests: d.requests.map((item) => (item._id === r._id ? { ...item, status: "rejected" } : item)),
                                    }));
                                  }}
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: "11px", color: "#94a3b8" }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="modal-actions" style={{ marginTop: "20px" }}>
          <button type="button" className="primary-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function EmployeesTable({ employees, loading, search, onClearSearch, onAdd, onViewRecords, onEdit, onDelete }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div><h2>All employees</h2><p>Team members across all countries and departments</p></div>
        <button className="text-button" onClick={onAdd}>Add employee <Plus size={15} /></button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>EMPLOYEE</th>
              <th>EMAIL</th>
              <th>DEPARTMENT</th>
              <th>COUNTRY</th>
              <th>ADDRESS</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="empty-state">Loading employees...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan="7" className="empty-state">{search ? "No matching employees found." : "No employees yet. Add your first employee with the button above."}</td></tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp._id}>
                  <td>
                    <div className="employee-cell">
                      <span className="employee-avatar">{emp.name?.[0]?.toUpperCase() || "E"}</span>
                      <span className="cell-strong">{emp.name}</span>
                    </div>
                  </td>
                  <td>{emp.email}</td>
                  <td>{emp.department || "—"}</td>
                  <td>{emp.country || "—"}</td>
                  <td>{emp.address || "—"}</td>
                  <td>
                    <span className={`status-badge status-${emp.status}`}>
                      {statusLabels[emp.status] || emp.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn" title="View employee records (devices & requests)" aria-label="View employee records" onClick={() => onViewRecords(emp)}>
                        <Eye size={14} />
                      </button>
                      <button className="action-btn" title="Edit employee" aria-label="Edit employee" onClick={() => onEdit(emp)}>
                        <Pencil size={14} />
                      </button>
                      <button className="action-btn action-btn-danger" title="Delete employee" aria-label="Delete employee" onClick={() => onDelete(emp)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="panel-footer">
        <span>{employees.length} employees</span>
        <button onClick={onClearSearch}>Clear search</button>
      </div>
    </section>
  );
}

function Dashboard({ user, onSignOut }) {
  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // Equipment state
  const [equipment, setEquipment] = useState([]);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [deletingEquipment, setDeletingEquipment] = useState(null);
  const [isDeletingEquipment, setIsDeletingEquipment] = useState(false);

  // Employees state
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [isDeletingEmployee, setIsDeletingEmployee] = useState(false);

  // Requests state
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [showAddRequest, setShowAddRequest] = useState(false);
  const [deletingRequest, setDeletingRequest] = useState(null);
  const [isDeletingRequest, setIsDeletingRequest] = useState(false);

  // Shipments state
  const [shipments, setShipments] = useState([]);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [showAddShipment, setShowAddShipment] = useState(false);
  const [trackingShipment, setTrackingShipment] = useState(null);

  // Returns state
  const [returnsList, setReturnsList] = useState([]);
  const [loadingReturns, setLoadingReturns] = useState(true);
  const [showAddReturn, setShowAddReturn] = useState(false);
  const [completingReturn, setCompletingReturn] = useState(null);

  // Users state (only admins can open the Users page)
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(user.role === "admin");
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resettingUser, setResettingUser] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [viewingEmployee, setViewingEmployee] = useState(null);

  const visibleNavigation = user.role === "employee"
    ? [
        { label: "Dashboard", icon: LayoutDashboard },
        { label: "Equipment", icon: Laptop, displayLabel: "My Devices" },
        { label: "Requests", icon: ClipboardList, displayLabel: "My Requests" },
        { label: "Shipments", icon: Truck, displayLabel: "My Shipments" },
        { label: "Returns", icon: RotateCcw, displayLabel: "My Returns" },
      ]
    : navigation.filter((entry) => entry.label !== "Users" || user.role === "admin");

  useEffect(() => {
    api("/equipment")
      .then(({ items }) => setEquipment(items || []))
      .catch(() => { })
      .finally(() => setLoadingEquipment(false));

    api("/employees")
      .then(({ employees: emps }) => setEmployees(emps || []))
      .catch(() => { })
      .finally(() => setLoadingEmployees(false));

    api("/requests")
      .then(({ requests: reqs }) => setRequests(reqs || []))
      .catch(() => { })
      .finally(() => setLoadingRequests(false));

    api("/shipments")
      .then(({ shipments: list }) => setShipments(list || []))
      .catch(() => { })
      .finally(() => setLoadingShipments(false));

    api("/returns")
      .then(({ returns: list }) => setReturnsList(list || []))
      .catch(() => { })
      .finally(() => setLoadingReturns(false));

    if (user.role === "admin") {
      api("/users")
        .then(({ users: list }) => setUsers(list || []))
        .catch(() => { })
        .finally(() => setLoadingUsers(false));
    }
  }, [user.role]);

  // Shipments shown in the dashboard tracking panel: the latest ones still on the way
  const panelShipments = shipments
    .filter((s) => s.status === "processing" || s.status === "in_transit")
    .slice(0, 4)
    .map((s) => ({
      _id: s._id,
      item: s.equipment?.name || "Equipment",
      destination: `${s.employee?.name || "Employee"}${s.destinationCountry ? ` · ${s.destinationCountry}` : ""}`,
      progress: shipmentProgress[s.status] ?? 0,
      status: statusLabels[s.status] || s.status,
    }));

  const visibleEquipment = equipment.filter((item) => {
    const assigneeName = item.assignedTo?.name || "";
    return `${item.name} ${item.type} ${item.serialNumber} ${item.country || ""} ${assigneeName} ${item.status}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const visibleEmployees = employees.filter((emp) =>
    `${emp.name} ${emp.email} ${emp.department || ""} ${emp.country || ""} ${emp.address || ""} ${emp.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const visibleRequests = requests.filter((r) => {
    const empName = r.employee?.name || "";
    return `${empName} ${r.item} ${r.itemType || ""} ${r.reason || ""} ${r.status || ""}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const visibleShipments = shipments.filter((s) =>
    `${s.equipment?.name || ""} ${s.equipment?.serialNumber || ""} ${s.employee?.name || ""} ${s.carrier || ""} ${s.trackingNumber || ""} ${s.destinationCountry || ""} ${s.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const visibleReturns = returnsList.filter((r) =>
    `${r.equipment?.name || ""} ${r.equipment?.serialNumber || ""} ${r.employee?.name || ""} ${r.reason || ""} ${r.condition || ""} ${r.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const visibleUsers = users.filter((u) =>
    `${u.name} ${u.email} ${u.role} ${u.active ? "active" : "deactivated"}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const activeEmployeesCount = employees.filter((emp) => emp.status === "active").length;
  const pendingRequestsCount = requests.filter((r) => r.status === "pending").length;

  const liveStats = user.role === "employee"
    ? [
        { label: "My Devices", value: equipment.length, note: "Assigned to you", icon: Laptop },
        { label: "Total Requests", value: requests.length, note: "Submitted requests", icon: Users },
        { label: "Pending Requests", value: pendingRequestsCount, note: "Awaiting approval", icon: Clock },
        { label: "In Transit", value: shipments.filter((s) => s.status === "in_transit" || s.status === "processing").length, note: "On the way to you", icon: Truck },
      ]
    : stats.map((stat) => {
        if (stat.label === "Total Equipment") return { ...stat, value: equipment.length };
        if (stat.label === "Active Employees") return { ...stat, value: activeEmployeesCount };
        if (stat.label === "Pending Requests") return { ...stat, value: pendingRequestsCount };
        if (stat.label === "In Transit") return { ...stat, value: equipment.filter((item) => item.status === "in_transit").length };
        return stat;
      });

  // Equipment actions
  async function confirmDeleteEquipment() {
    if (!deletingEquipment) return;
    setIsDeletingEquipment(true);
    try {
      await api(`/equipment/${deletingEquipment._id}`, { method: "DELETE" });
      setEquipment((list) => list.filter((item) => item._id !== deletingEquipment._id));
      setDeletingEquipment(null);
    } catch (err) {
      alert(err.message || "Failed to delete equipment");
    } finally {
      setIsDeletingEquipment(false);
    }
  }

  // Employee actions
  async function confirmDeleteEmployee() {
    if (!deletingEmployee) return;
    setIsDeletingEmployee(true);
    try {
      await api(`/employees/${deletingEmployee._id}`, { method: "DELETE" });
      const deletedId = deletingEmployee._id;
      setEmployees((list) => list.filter((emp) => emp._id !== deletedId));
      setEquipment((list) =>
        list.map((item) =>
          item.assignedTo?._id === deletedId || item.assignedTo === deletedId
            ? { ...item, assignedTo: null, status: "available" }
            : item
        )
      );
      setDeletingEmployee(null);
    } catch (err) {
      alert(err.message || "Failed to delete employee");
    } finally {
      setIsDeletingEmployee(false);
    }
  }

  // Request actions
  async function handleUpdateRequestStatus(id, newStatus) {
    try {
      const { request: updated } = await api(`/requests/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      setRequests((list) => list.map((r) => (r._id === id ? updated : r)));
      refreshEquipment();
      api("/employees").then(({ employees: emps }) => setEmployees(emps || [])).catch(() => {});
    } catch (err) {
      alert(err.message || "Failed to update request status");
    }
  }

  async function confirmDeleteRequest() {
    if (!deletingRequest) return;
    setIsDeletingRequest(true);
    try {
      await api(`/requests/${deletingRequest._id}`, { method: "DELETE" });
      setRequests((list) => list.filter((r) => r._id !== deletingRequest._id));
      setDeletingRequest(null);
    } catch (err) {
      alert(err.message || "Failed to delete request");
    } finally {
      setIsDeletingRequest(false);
    }
  }

  // Shipment actions (the server also updates the equipment, so reload it afterwards)
  function refreshEquipment() {
    api("/equipment")
      .then(({ items }) => setEquipment(items || []))
      .catch(() => { });
  }

  async function handleShipmentStatus(id, status, note = "") {
    try {
      const { shipment } = await api(`/shipments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, note }),
      });
      setShipments((list) => list.map((s) => (s._id === id ? shipment : s)));
      setTrackingShipment((current) => (current && current._id === id ? shipment : current));
      refreshEquipment();
    } catch (err) {
      alert(err.message || "Failed to update shipment");
    }
  }

  async function handleDeleteShipment(shipment) {
    if (!window.confirm("Delete this shipment record?")) return;
    try {
      await api(`/shipments/${shipment._id}`, { method: "DELETE" });
      setShipments((list) => list.filter((s) => s._id !== shipment._id));
    } catch (err) {
      alert(err.message || "Failed to delete shipment");
    }
  }

  // Return actions (completing a return puts the equipment back in stock or retires it)
  async function handleReturnStatus(id, status, extra = {}) {
    try {
      const { equipmentReturn } = await api(`/returns/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, ...extra }),
      });
      setReturnsList((list) => list.map((r) => (r._id === id ? equipmentReturn : r)));
      if (status === "completed") refreshEquipment();
      return true;
    } catch (err) {
      alert(err.message || "Failed to update return");
      return false;
    }
  }

  async function handleDeleteReturn(item) {
    if (!window.confirm("Delete this return record?")) return;
    try {
      await api(`/returns/${item._id}`, { method: "DELETE" });
      setReturnsList((list) => list.filter((r) => r._id !== item._id));
    } catch (err) {
      alert(err.message || "Failed to delete return");
    }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-icon"><Package size={23} /></div><span>globit<span className="brand-dot">.</span></span><button className="mobile-close" onClick={() => setMenuOpen(false)}><X size={20} /></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="navigation">{visibleNavigation.map(({ label, icon: Icon, displayLabel }) => <button key={label} className={`nav-item ${activePage === label ? "nav-active" : ""}`} onClick={() => { setActivePage(label); setMenuOpen(false); setSearch(""); }}><Icon size={19} /><span>{displayLabel || label}</span></button>)}</nav>
        <div className="sidebar-bottom"><div className="help-card"><div className="help-icon">✦</div><strong>Need a hand?</strong><p>Manage your global equipment with ease.</p><button onClick={() => alert("Help centre coming soon!")}>Visit help centre ↗</button></div><div className="profile"><div className="avatar avatar-purple">{user.name[0]}</div><div className="profile-info"><strong>{user.name}</strong><span>{user.role}</span></div><button className="dashboard-signout" onClick={onSignOut} title="Sign out" aria-label="Sign out"><ArrowRight size={16} /></button></div></div>
      </aside>
      {menuOpen && <button className="mobile-overlay" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}

      {/* Equipment Modals */}
      {showAddEquipment && (
        <AddEquipmentModal
          employees={employees}
          onClose={() => setShowAddEquipment(false)}
          onAdded={(item) => {
            setEquipment((list) => [item, ...list]);
            setShowAddEquipment(false);
          }}
        />
      )}

      {editingEquipment && (
        <EditEquipmentModal
          item={editingEquipment}
          employees={employees}
          onClose={() => setEditingEquipment(null)}
          onUpdated={(updated) => {
            setEquipment((list) => list.map((item) => (item._id === updated._id ? updated : item)));
            setEditingEquipment(null);
          }}
        />
      )}

      {deletingEquipment && (
        <DeleteConfirmModal
          title="Delete equipment"
          message="Are you sure you want to delete"
          itemName={deletingEquipment.name}
          loading={isDeletingEquipment}
          onClose={() => setDeletingEquipment(null)}
          onConfirm={confirmDeleteEquipment}
        />
      )}

      {/* Employee Modals */}
      {showAddEmployee && (
        <AddEmployeeModal
          onClose={() => setShowAddEmployee(false)}
          onAdded={(employee) => {
            setEmployees((list) => [employee, ...list]);
            setShowAddEmployee(false);
            if (user.role === "admin") {
              api("/users").then(({ users: list }) => setUsers(list || [])).catch(() => {});
            }
          }}
        />
      )}

      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onUpdated={(updated) => {
            setEmployees((list) => list.map((emp) => (emp._id === updated._id ? updated : emp)));
            setEquipment((list) =>
              list.map((item) =>
                item.assignedTo?._id === updated._id
                  ? { ...item, assignedTo: { ...item.assignedTo, name: updated.name, email: updated.email, department: updated.department } }
                  : item
              )
            );
            setEditingEmployee(null);
          }}
        />
      )}

      {viewingEmployee && (
        <EmployeeDetailsModal
          employee={viewingEmployee}
          onClose={() => setViewingEmployee(null)}
          onUpdateRequestStatus={handleUpdateRequestStatus}
        />
      )}

      {deletingEmployee && (
        <DeleteConfirmModal
          title="Delete employee"
          message="Are you sure you want to remove employee"
          itemName={deletingEmployee.name}
          loading={isDeletingEmployee}
          onClose={() => setDeletingEmployee(null)}
          onConfirm={confirmDeleteEmployee}
        />
      )}

      {/* Request Modals */}
      {showAddRequest && (
        <AddRequestModal
          employees={employees}
          currentUser={user}
          onClose={() => setShowAddRequest(false)}
          onAdded={(request) => {
            setRequests((list) => [request, ...list]);
            setShowAddRequest(false);
          }}
        />
      )}

      {deletingRequest && (
        <DeleteConfirmModal
          title="Delete request"
          message="Are you sure you want to delete request for"
          itemName={deletingRequest.item}
          loading={isDeletingRequest}
          onClose={() => setDeletingRequest(null)}
          onConfirm={confirmDeleteRequest}
        />
      )}

      {/* Shipment Modals */}
      {showAddShipment && (
        <AddShipmentModal
          equipment={equipment}
          employees={employees}
          onClose={() => setShowAddShipment(false)}
          onAdded={(shipment) => {
            setShipments((list) => [shipment, ...list]);
            setShowAddShipment(false);
            refreshEquipment();
          }}
        />
      )}

      {trackingShipment && (
        <TrackingModal shipment={trackingShipment} onClose={() => setTrackingShipment(null)} />
      )}

      {/* Return Modals */}
      {showAddReturn && (
        <AddReturnModal
          equipment={equipment}
          onClose={() => setShowAddReturn(false)}
          onAdded={(equipmentReturn) => {
            setReturnsList((list) => [equipmentReturn, ...list]);
            setShowAddReturn(false);
          }}
        />
      )}

      {completingReturn && (
        <CompleteReturnModal
          item={completingReturn}
          onClose={() => setCompletingReturn(null)}
          onSubmit={(id, extra) => handleReturnStatus(id, "completed", extra)}
        />
      )}

      {/* User Modals */}
      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onAdded={(created) => {
            setUsers((list) => [created, ...list]);
            setShowAddUser(false);
            api("/employees").then(({ employees: list }) => setEmployees(list || [])).catch(() => {});
          }}
        />
      )}

      {editingUser && (
        <EditUserModal
          item={editingUser}
          isSelf={editingUser.id === user.id}
          onClose={() => setEditingUser(null)}
          onSaved={(updated) => {
            setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)));
            setEditingUser(null);
          }}
        />
      )}

      {resettingUser && <ResetPasswordModal item={resettingUser} onClose={() => setResettingUser(null)} />}

      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)}><Menu size={22} /></button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>{activePage}</strong></div>
          <div className="topbar-actions">
            <div className="search-box">
              <Search size={17} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={activePage === "Equipment" ? "Search equipment..." : activePage === "Employees" ? "Search employees..." : activePage === "Requests" ? "Search requests..." : activePage === "Shipments" ? "Search shipments..." : activePage === "Returns" ? "Search returns..." : activePage === "Users" ? "Search users..." : "Search..."}
                aria-label="Search"
              />
            </div>
            <button className="notification-button" aria-label="Change password" title="Change password" onClick={() => setShowChangePassword(true)}><LockKeyhole size={18} /></button>
            <button className="notification-button" aria-label="Notifications" onClick={() => alert("No notifications yet.")}><Bell size={19} /></button>
            <div className="avatar avatar-light">{user.name[0]}</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="live-dot" /> {user.role === "employee" ? "EMPLOYEE SELF-SERVICE PORTAL" : "GLOBAL EQUIPMENT OPERATIONS"}</div>
              <h1>{user.role === "employee" ? (activePage === "Dashboard" ? `Welcome, ${user.name}` : activePage === "Equipment" ? "My devices" : activePage === "Requests" ? "My requests" : activePage === "Shipments" ? "My shipments" : activePage === "Returns" ? "My returns" : activePage) : (activePage === "Dashboard" ? "Equipment overview" : activePage)}</h1>
              <p className="welcome-subtitle">
                {user.role === "employee"
                  ? activePage === "Dashboard"
                    ? "Your personal workspace. Track assigned devices, submit requests, and check shipments."
                    : activePage === "Equipment"
                      ? "Hardware and peripherals currently assigned to your employee account."
                      : activePage === "Requests"
                        ? "Equipment requests you have submitted and their live status."
                        : activePage === "Shipments"
                          ? "Equipment packages currently in transit to your location."
                          : activePage === "Returns"
                            ? "Equipment return records."
                            : `Manage ${activePage.toLowerCase()}.`
                  : activePage === "Dashboard"
                    ? "Your workspace overview will appear here as records are added."
                    : activePage === "Employees"
                      ? "Manage your global workforce and employee records in one place."
                      : activePage === "Requests"
                        ? "Review, approve, and manage equipment requests submitted by employees."
                        : activePage === "Shipments"
                          ? "Create shipments, follow their progress and confirm deliveries."
                          : activePage === "Returns"
                            ? "Record returned devices, inspect them and put them back in stock."
                            : activePage === "Users"
                              ? "Create accounts, set roles and control who can sign in."
                              : `Manage ${activePage.toLowerCase()} in one place.`}
              </p>
            </div>
            <button
              className="primary-button"
              onClick={() => {
                if (user.role === "employee") setShowAddRequest(true);
                else if (activePage === "Employees") setShowAddEmployee(true);
                else if (activePage === "Equipment" || activePage === "Dashboard") setShowAddEquipment(true);
                else if (activePage === "Requests") setShowAddRequest(true);
                else if (activePage === "Shipments") setShowAddShipment(true);
                else if (activePage === "Returns") setShowAddReturn(true);
                else if (activePage === "Users") setShowAddUser(true);
                else alert("We'll add this feature when we build the forms.");
              }}
            >
              <Plus size={18} /> {user.role === "employee" ? "Request device" : `Add ${activePage === "Employees" ? "employee" : activePage === "Requests" ? "request" : activePage === "Dashboard" ? "equipment" : activePage.replace(/s$/, "")}`}
            </button>
          </section>

          <section className="stats-grid">
            {liveStats.map(({ label, value, note, icon: Icon }, index) => (
              <article className="stat-card" key={label}>
                <div className="stat-top">
                  <span className="stat-label">{label}</span>
                  <div className={`stat-icon stat-icon-${index}`}><Icon size={20} /></div>
                </div>
                <div className="stat-value">{value}</div>
                <div className={`stat-note ${index === 2 ? "note-muted" : ""}`}><span>{note}</span></div>
              </article>
            ))}
          </section>

          {activePage === "Equipment" ? (
            <EquipmentTable
              items={visibleEquipment}
              loading={loadingEquipment}
              search={search}
              role={user.role}
              onClearSearch={() => setSearch("")}
              onAdd={() => setShowAddEquipment(true)}
              onRequestReturn={() => setShowAddReturn(true)}
              onEdit={(item) => setEditingEquipment(item)}
              onDelete={(item) => setDeletingEquipment(item)}
            />
          ) : activePage === "Employees" ? (
            <EmployeesTable
              employees={visibleEmployees}
              loading={loadingEmployees}
              search={search}
              onClearSearch={() => setSearch("")}
              onAdd={() => setShowAddEmployee(true)}
              onViewRecords={(emp) => setViewingEmployee(emp)}
              onEdit={(emp) => setEditingEmployee(emp)}
              onDelete={(emp) => setDeletingEmployee(emp)}
            />
          ) : activePage === "Requests" ? (
            <RequestsTable
              requests={visibleRequests}
              loading={loadingRequests}
              search={search}
              role={user.role}
              onClearSearch={() => setSearch("")}
              onAdd={() => setShowAddRequest(true)}
              onUpdateStatus={handleUpdateRequestStatus}
              onDelete={(req) => setDeletingRequest(req)}
            />
          ) : activePage === "Shipments" ? (
            <ShipmentsTable
              shipments={visibleShipments}
              loading={loadingShipments}
              search={search}
              role={user.role}
              onClearSearch={() => setSearch("")}
              onAdd={() => setShowAddShipment(true)}
              onTrack={(shipment) => setTrackingShipment(shipment)}
              onStatus={handleShipmentStatus}
              onDelete={handleDeleteShipment}
            />
          ) : activePage === "Returns" ? (
            <ReturnsTable
              returns={visibleReturns}
              loading={loadingReturns}
              search={search}
              role={user.role}
              onClearSearch={() => setSearch("")}
              onAdd={() => setShowAddReturn(true)}
              onReceive={(id) => handleReturnStatus(id, "received")}
              onComplete={(item) => setCompletingReturn(item)}
              onCancel={(id) => handleReturnStatus(id, "cancelled")}
              onDelete={handleDeleteReturn}
            />
          ) : activePage === "Users" ? (
            <UsersTable
              users={visibleUsers}
              loading={loadingUsers}
              search={search}
              currentUserId={user.id}
              onClearSearch={() => setSearch("")}
              onAdd={() => setShowAddUser(true)}
              onEdit={(item) => setEditingUser(item)}
              onReset={(item) => setResettingUser(item)}
            />
          ) : (
            <section className="content-grid">
              <article className="panel requests-panel">
                <div className="panel-heading">
                  <div><h2>Recent requests</h2><p>{user.role === "employee" ? "Your equipment requests and status" : "Equipment requests submitted by employees"}</p></div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="text-button" onClick={() => setShowAddRequest(true)}>Add request <Plus size={14} /></button>
                    <button className="text-button" onClick={() => setActivePage("Requests")}>View all <ArrowUpRight size={15} /></button>
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>EMPLOYEE</th><th>EQUIPMENT</th><th>DATE</th><th>STATUS</th></tr></thead>
                    <tbody>
                      {visibleRequests.length === 0 ? (
                        <tr><td colSpan="4" className="empty-state">{search ? "No matching requests found." : user.role === "employee" ? "You have not submitted any device requests yet." : "No requests yet. New requests will appear here."}</td></tr>
                      ) : (
                        visibleRequests.map((request) => (
                          <tr key={request._id}>
                            <td>
                              <div className="assignee-badge">
                                <span className="assignee-avatar">
                                  {request.employee?.name?.[0]?.toUpperCase() || "E"}
                                </span>
                                <span>{request.employee?.name || "Unknown"}</span>
                              </div>
                            </td>
                            <td className="cell-strong">{request.item}</td>
                            <td>{request.date}</td>
                            <td>
                              <span className={`status-badge status-${request.status}`}>
                                {statusLabels[request.status] || request.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="panel-footer"><span>{visibleRequests.length} requests</span><button onClick={() => setSearch("")}>Clear search</button></div>
              </article>
              <article className="panel shipment-panel">
                <div className="panel-heading">
                  <div><h2>Shipment tracking</h2><p>Track equipment deliveries worldwide</p></div>
                  <button className="icon-button" onClick={() => setActivePage("Shipments")} aria-label="View shipments"><ArrowUpRight size={18} /></button>
                </div>
                <div className="shipment-list">
                  {panelShipments.length === 0 ? (
                    <div className="empty-state shipment-empty">
                      <Package size={27} /><p>No active shipments.</p><span>Shipment details will appear here when added.</span>
                    </div>
                  ) : (
                    panelShipments.map((shipment) => (
                      <div className="shipment-item" key={shipment._id}>
                        <div className="shipment-product-icon"><Package size={20} /></div>
                        <div className="shipment-details">
                          <div className="shipment-title-row"><strong>{shipment.item}</strong><span>{shipment.progress}%</span></div>
                          <p>{shipment.destination}</p>
                          <div className="progress-track"><div className="progress-fill" style={{ width: `${shipment.progress}%` }} /></div>
                          <span className="shipment-status">{shipment.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button className="shipment-footer" onClick={() => setActivePage("Shipments")}>View shipments <ArrowUpRight size={16} /></button>
              </article>
            </section>
          )}

          <section className="bottom-banner">
            <div className="banner-symbol"><Package size={23} /></div>
            <div className="banner-copy"><strong>Your global equipment hub</strong><p>Manage equipment from procurement to recovery in one place.</p></div>
            <div className="banner-check"><CheckCircle2 size={19} /> Workspace ready</div>
          </section>
          <footer className="page-footer"><span>© 2026 Globit</span><span>Global equipment. Simplified.</span></footer>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [view, setView] = useState("loading");
  const [user, setUser] = useState(null);

  // On page load, check whether a valid login cookie already exists
  useEffect(() => {
    api("/auth/me")
      .then(({ user }) => {
        setUser(user);
        setView("dashboard");
      })
      .catch(() => setView("landing"));
  }, []);

  async function handleSignOut() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // even if the request fails, sign out on screen
    }
    setUser(null);
    setView("landing");
  }

  if (view === "loading") return null;
  if (view === "signin") return <SignInPage onBack={() => setView("landing")} onSignedIn={(u) => { setUser(u); setView("dashboard"); }} />;
  if (view === "dashboard" && user) return <Dashboard user={user} onSignOut={handleSignOut} />;
  return <LandingPage onSignIn={() => setView("signin")} onGetStarted={() => setView("signin")} />;
}

export default App;

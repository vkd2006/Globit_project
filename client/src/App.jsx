import { useState, useEffect } from "react";
import {
  LayoutDashboard, Laptop, Users, ClipboardList, Truck, RotateCcw,
  Search, Bell, Plus, ArrowUpRight, Package, Clock, CheckCircle2,
  Menu, X, Globe2, ShieldCheck, ArrowRight, Mail, LockKeyhole,
  Eye, EyeOff, Boxes, MapPin, CircleCheck, Pencil, Trash2,
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
};

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

function EquipmentTable({ items, loading, search, onClearSearch, onAdd, onEdit, onDelete }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div><h2>All equipment</h2><p>Every device registered in your workspace</p></div>
        <button className="text-button" onClick={onAdd}>Add equipment <Plus size={15} /></button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>NAME</th>
              <th>TYPE</th>
              <th>SERIAL NUMBER</th>
              <th>COUNTRY</th>
              <th>ASSIGNED TO</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="empty-state">Loading equipment...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="7" className="empty-state">{search ? "No matching equipment found." : "No equipment yet. Add your first item with the button above."}</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item._id}>
                  <td className="cell-strong">{item.name}</td>
                  <td className="cell-capitalize">{item.type}</td>
                  <td>{item.serialNumber}</td>
                  <td>{item.country || "—"}</td>
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
                  <td><span className={`status-badge status-${item.status}`}>{statusLabels[item.status] || item.status}</span></td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn" title="Edit / Assign equipment" aria-label="Edit equipment" onClick={() => onEdit(item)}>
                        <Pencil size={14} />
                      </button>
                      <button className="action-btn action-btn-danger" title="Delete equipment" aria-label="Delete equipment" onClick={() => onDelete(item)}>
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

function EmployeesTable({ employees, loading, search, onClearSearch, onAdd, onEdit, onDelete }) {
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

  useEffect(() => {
    api("/equipment")
      .then(({ items }) => setEquipment(items || []))
      .catch(() => {})
      .finally(() => setLoadingEquipment(false));

    api("/employees")
      .then(({ employees: emps }) => setEmployees(emps || []))
      .catch(() => {})
      .finally(() => setLoadingEmployees(false));
  }, []);

  const requests = [];
  const shipments = [];

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

  const activeEmployeesCount = employees.filter((emp) => emp.status === "active").length;

  const liveStats = stats.map((stat) => {
    if (stat.label === "Total Equipment") return { ...stat, value: equipment.length };
    if (stat.label === "Active Employees") return { ...stat, value: activeEmployeesCount };
    if (stat.label === "In Transit") return { ...stat, value: equipment.filter((item) => item.status === "in_transit").length };
    return stat;
  });

  const visibleRequests = requests.filter((request) => `${request.name} ${request.item}`.toLowerCase().includes(search.toLowerCase()));

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
      // Any equipment assigned to this employee is now unassigned
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

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-icon"><Package size={23} /></div><span>globit<span className="brand-dot">.</span></span><button className="mobile-close" onClick={() => setMenuOpen(false)}><X size={20} /></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="navigation">{navigation.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${activePage === label ? "nav-active" : ""}`} onClick={() => { setActivePage(label); setMenuOpen(false); setSearch(""); }}><Icon size={19} /><span>{label}</span></button>)}</nav>
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
          }}
        />
      )}

      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onUpdated={(updated) => {
            setEmployees((list) => list.map((emp) => (emp._id === updated._id ? updated : emp)));
            // Update assignedTo name in equipment list if it was changed
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
                placeholder={activePage === "Equipment" ? "Search equipment..." : activePage === "Employees" ? "Search employees..." : "Search requests..."}
                aria-label="Search"
              />
            </div>
            <button className="notification-button" aria-label="Notifications" onClick={() => alert("No notifications yet.")}><Bell size={19} /></button>
            <div className="avatar avatar-light">{user.name[0]}</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="live-dot" /> GLOBAL EQUIPMENT OPERATIONS</div>
              <h1>{activePage === "Dashboard" ? "Equipment overview" : activePage}</h1>
              <p className="welcome-subtitle">
                {activePage === "Dashboard"
                  ? "Your workspace overview will appear here as records are added."
                  : activePage === "Employees"
                  ? "Manage your global workforce and employee records in one place."
                  : `Manage ${activePage.toLowerCase()} in one place.`}
              </p>
            </div>
            <button
              className="primary-button"
              onClick={() => {
                if (activePage === "Employees") setShowAddEmployee(true);
                else if (activePage === "Dashboard" || activePage === "Equipment") setShowAddEquipment(true);
                else alert("We'll add this feature when we build the forms.");
              }}
            >
              <Plus size={18} /> Add {activePage === "Employees" ? "employee" : activePage === "Dashboard" ? "equipment" : activePage.replace(/s$/, "")}
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
              onClearSearch={() => setSearch("")}
              onAdd={() => setShowAddEquipment(true)}
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
              onEdit={(emp) => setEditingEmployee(emp)}
              onDelete={(emp) => setDeletingEmployee(emp)}
            />
          ) : (
            <section className="content-grid">
              <article className="panel requests-panel">
                <div className="panel-heading">
                  <div><h2>Recent requests</h2><p>Equipment requests submitted by employees</p></div>
                  <button className="text-button" onClick={() => setActivePage("Requests")}>View all <ArrowUpRight size={15} /></button>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>EMPLOYEE</th><th>EQUIPMENT</th><th>DATE</th><th>STATUS</th></tr></thead>
                    <tbody>
                      {visibleRequests.length === 0 ? (
                        <tr><td colSpan="4" className="empty-state">{search ? "No matching requests found." : "No requests yet. New requests will appear here."}</td></tr>
                      ) : (
                        visibleRequests.map((request) => (
                          <tr key={request._id}>
                            <td>{request.name}</td>
                            <td>{request.item}</td>
                            <td>{request.date}</td>
                            <td>{request.status}</td>
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
                  {shipments.length === 0 ? (
                    <div className="empty-state shipment-empty">
                      <Package size={27} /><p>No shipments yet.</p><span>Shipment details will appear here when added.</span>
                    </div>
                  ) : (
                    shipments.map((shipment) => (
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

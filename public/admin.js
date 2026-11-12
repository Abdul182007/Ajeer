const $ = (id) => document.getElementById(id);
const API = "/api";
let token = sessionStorage.getItem("employee_admin_token") || "";
let employees = [];
let editingId = null;

function authHeaders(json = true) {
  const headers = { Authorization: `Bearer ${token}` };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    logout();
    throw new Error(data.message || "Please log in again.");
  }
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}

function showDashboard(username) {
  $("loginPanel").hidden = true;
  $("dashboard").hidden = false;
  $("adminWelcome").textContent = `Signed in as ${username || "admin"}`;
  loadEmployees();
}

function logout() {
  token = "";
  sessionStorage.removeItem("employee_admin_token");
  employees = [];
  editingId = null;
  $("dashboard").hidden = true;
  $("loginPanel").hidden = false;
  $("loginForm").reset();
}

$("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  $("loginMessage").textContent = "Signing in...";
  try {
    const result = await apiRequest(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.get("username"), password: form.get("password") })
    });
    token = result.token;
    sessionStorage.setItem("employee_admin_token", token);
    $("loginMessage").textContent = "";
    showDashboard(result.username);
  } catch (error) {
    $("loginMessage").textContent = error.message;
  }
});

function getFormData() {
  const form = $("employeeForm");
  const data = Object.fromEntries(new FormData(form).entries());
  data.active = form.elements.active.checked;
  return data;
}

$("employeeForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  $("formMessage").textContent = "Saving...";
  const data = getFormData();
  if (data.declarationExpiryDate < data.declarationStartDate) {
    $("formMessage").textContent = "Expiry date cannot be earlier than start date.";
    return;
  }
  try {
    const url = editingId ? `${API}/employees/${editingId}` : `${API}/employees`;
    await apiRequest(url, {
      method: editingId ? "PUT" : "POST",
      headers: authHeaders(),
      body: JSON.stringify(data)
    });
    $("formMessage").textContent = editingId ? "Employee updated successfully." : "Employee added successfully.";
    resetForm();
    await loadEmployees();
  } catch (error) {
    $("formMessage").textContent = error.message;
  }
});

function resetForm() {
  editingId = null;
  $("employeeForm").reset();
  $("employeeForm").elements.active.checked = true;
  $("formTitle").textContent = "Add employee";
  $("saveBtn").textContent = "Add employee";
}

$("clearBtn").addEventListener("click", () => {
  resetForm();
  $("formMessage").textContent = "";
});

$("logoutBtn").addEventListener("click", logout);
$("refreshBtn").addEventListener("click", loadEmployees);
$("searchInput").addEventListener("input", renderEmployees);

async function loadEmployees() {
  $("employeeRows").innerHTML = '<tr><td colspan="5">Loading records...</td></tr>';
  try {
    employees = await apiRequest(`${API}/employees`, { headers: authHeaders(false) });
    updateStats();
    renderEmployees();
  } catch (error) {
    $("employeeRows").innerHTML = `<tr><td colspan="5">${escapeHtml(error.message)}</td></tr>`;
  }
}

function updateStats() {
  const active = employees.filter((employee) => employee.active).length;
  $("totalCount").textContent = employees.length;
  $("activeCount").textContent = active;
  $("inactiveCount").textContent = employees.length - active;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function renderEmployees() {
  const term = $("searchInput").value.trim().toLowerCase();
  const filtered = employees.filter((e) =>
    [e.employeeName, e.permitNumber, e.permitType, e.establishmentName,
      e.establishmentNumber, e.nationality, e.occupation, e.residenceNumber]
      .some((value) => String(value || "").toLowerCase().includes(term))
  );
  $("employeeRows").innerHTML = filtered.length ? filtered.map((e) => `
    <tr>
      <td>${escapeHtml(e.employeeName)}</td>
      <td>${escapeHtml(e.permitNumber)}</td>
      <td>${escapeHtml(e.establishmentName)}</td>
      <td><span class="status ${e.active ? "active" : "inactive"}">${e.active ? "Active" : "Inactive"}</span></td>
      <td class="actions">
        <button type="button" class="view-button" data-view="${e._id}">View permit</button>
        <button type="button" data-edit="${e._id}">Edit</button>
        <button type="button" class="delete-button" data-delete="${e._id}">Delete</button>
      </td>
    </tr>`).join("") : '<tr><td colspan="5">No employee records found.</td></tr>';

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => viewPermit(button.dataset.view));
  });
  document.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => editEmployee(button.dataset.edit));
  });
  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteEmployee(button.dataset.delete));
  });
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? escapeHtml(value) : date.toLocaleDateString();
}

function viewPermit(id) {
  const employee = employees.find((item) => item._id === id);
  if (!employee) return;
  const fields = [
    ["Permit number", employee.permitNumber],
    ["Permit type", employee.permitType],
    ["Permit start date", formatDate(employee.declarationStartDate)],
    ["Permit expiry date", formatDate(employee.declarationExpiryDate)],
    ["Employee name", employee.employeeName],
    ["Occupation", employee.occupation],
    ["Nationality", employee.nationality],
    ["Date of birth", formatDate(employee.dateOfBirth)],
    ["Sex", employee.sex],
    ["Residence / ID number", employee.residenceNumber],
    ["Establishment name", employee.establishmentName],
    ["Establishment number", employee.establishmentNumber],
    ["Permit status", employee.active ? "Active" : "Inactive"]
  ];
  $("permitDetails").innerHTML = fields.map(([label, value]) => `
    <div class="permit-detail-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "—")}</strong></div>
  `).join("");
  $("permitModal").hidden = false;
  document.body.classList.add("modal-open");
  $("closePermitBtn").focus();
}

function closePermit() {
  $("permitModal").hidden = true;
  document.body.classList.remove("modal-open");
}

$("closePermitBtn").addEventListener("click", closePermit);
$("closePermitBtnBottom").addEventListener("click", closePermit);
$("permitModal").addEventListener("click", (event) => {
  if (event.target === $("permitModal")) closePermit();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !$("permitModal").hidden) closePermit();
});
$("printPermitBtn").addEventListener("click", () => {
  const content = $("permitDetails").innerHTML;
  const printWindow = window.open("", "_blank", "width=850,height=700");
  if (!printWindow) {
    alert("Please allow pop-ups to print the permit details.");
    return;
  }
  printWindow.document.write(`<!doctype html><html><head><title>Employee permit</title><meta charset="utf-8"><style>
    body{font-family:Arial,sans-serif;color:#172033;padding:28px}h1{color:#08734b;text-align:center}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.permit-detail-item{border:1px solid #d8dfdc;padding:12px;border-radius:6px;break-inside:avoid}
    .permit-detail-item span{display:block;color:#667085;font-size:12px;margin-bottom:6px}.permit-detail-item strong{font-size:14px}
    @media print{body{padding:0}}
  </style></head><body><h1>Employee Permit Details</h1><div class="grid">${content}</div><script>window.onload=()=>window.print()<\/script></body></html>`);
  printWindow.document.close();
});

function editEmployee(id) {
  const employee = employees.find((item) => item._id === id);
  if (!employee) return;
  editingId = id;
  const form = $("employeeForm");
  for (const key of [
    "permitNumber", "permitType", "declarationStartDate", "declarationExpiryDate",
    "employeeName", "occupation", "nationality", "dateOfBirth", "sex",
    "residenceNumber", "establishmentName", "establishmentNumber"
  ]) form.elements[key].value = employee[key] || "";
  form.elements.active.checked = Boolean(employee.active);
  $("formTitle").textContent = "Edit employee";
  $("saveBtn").textContent = "Save changes";
  $("formMessage").textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteEmployee(id) {
  const employee = employees.find((item) => item._id === id);
  if (!employee || !confirm(`Delete ${employee.employeeName}'s record? This cannot be undone.`)) return;
  try {
    await apiRequest(`${API}/employees/${id}`, { method: "DELETE", headers: authHeaders(false) });
    await loadEmployees();
    $("formMessage").textContent = "Employee deleted successfully.";
  } catch (error) {
    $("formMessage").textContent = error.message;
  }
}

(async function init() {
  if (!token) return;
  try {
    const result = await apiRequest(`${API}/employees`, { headers: authHeaders(false) });
    employees = result;
    showDashboard("admin");
  } catch {
    logout();
  }
})();

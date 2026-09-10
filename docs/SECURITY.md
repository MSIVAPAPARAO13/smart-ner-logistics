# SIH26002 Production Security & RBAC Specification

## 1. Authentication & Role-Based Access Control (RBAC)

The platform enforces strict role-based access control with JSON Web Tokens (JWT):

| Role | Permissions & Access Scope |
| :--- | :--- |
| **`ADMIN`** | Full system administration, database resets, model registry activations, and global configuration. |
| **`DISPATCHER`** | Fleet dispatching, dynamic rerouting overrides, multi-vehicle VRP execution, and emergency broadcasts. |
| **`FIELD_OFFICER`** | Incident reporting, geotagged evidence photograph uploads, and ground hazard verification. |
| **`DRIVER`** | Assigned vehicle telemetry monitoring, turn-by-turn bypass guidance, and delivery confirmation. |
| **`VIEWER`** | Read-only observation of GIS map, public corridor advisories, and weather layers. |

---

## 2. File & Upload Security Hardening

To prevent arbitrary file upload vulnerabilities and path traversal attacks:
1. **MIME Type Whitelist**: Only `image/jpeg`, `image/png`, and `image/webp` are permitted.
2. **File Size Limit**: Hard ceiling of **5 MB** enforced before disk buffer write.
3. **Randomized UUID Paths**: Files are saved with cryptographically random `uuid4().hex` identifiers, completely stripping user-supplied filenames.
4. **Directory Isolation**: Static uploads directory is strictly segregated from source code execution roots.

---

## 3. Distributed Tracing & Correlation IDs
Every HTTP request receives a unique `X-Correlation-ID` header. If not provided by client, the backend middleware automatically generates one using `uuid.uuid4()`. All internal log events (ML inference, OR-Tools optimization, WebSocket updates) are tagged with this correlation ID.

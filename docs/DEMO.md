# SIH26002 Evaluator Demonstration Script (20-Step Hero Workflow)

**Problem Statement:** SIH26002 — AI-Based Smart Logistics and Accessibility Intelligence Platform for the North Eastern Region (NER)  
**Target Ministry:** Ministry of Development of North Eastern Region (MDoNER)

---

## 🎯 Demonstration Objective
Demonstrate the complete closed-loop lifecycle of how our platform autonomously protects critical medical supplies during a severe monsoon flood in Southern Assam/Meghalaya using **Deep Learning Routing (RRNCO)**, **OR-Tools Constraint Optimization**, and **Multilingual Emergency Dispatch**.

---

## 🎬 Step-by-Step Evaluator Walkthrough

1. **Launch Command Center**:
   - Open `http://localhost:5173`.
   - Observe the interactive NER GIS map showing Assam and Meghalaya national highway corridors (NH-6, NH-27, NH-54).
2. **Inspect Moving Logistics Fleet**:
   - 4 live vehicles active on the corridor:
     - `MED-01`: Critical Medicine (Guwahati $\to$ Silchar Medical College)
     - `FOOD-02`: Essential Food (Guwahati $\to$ Shillong)
     - `RELIEF-03`: Relief Tarpaulins (Nagaon $\to$ Haflong)
     - `CON-04`: Construction Equipment (Lumding $\to$ Silchar)
3. **Inspect Real-Time Weather Layer**:
   - Open-Meteo live precipitation overlay showing monsoon rain across the Cachar valley.
4. **Trigger Flood Disruption Simulation**:
   - Click the **`Trigger Flood Scenario`** button on the control panel.
5. **Observe Flood Expansion on GIS Map**:
   - A high-severity flood polygon expands across Sonapur ghat and Lubha River bridge (NH-6).
6. **Road Segment Turns Red (Blocked)**:
   - NH-6 accessibility index drops from 100% to 0%; road state changes to `CRITICAL / BLOCKED`.
7. **Affected Vehicle Highlights**:
   - `MED-01` enters collision hazard zone on the blocked NH-6 corridor.
8. **LightGBM Disruption Prediction**:
   - Disruption risk spikes to $85.0\%$, predicting a 145-minute delay on NH-6.
9. **Neural Candidate Proposed (RRNCO / GNN)**:
   - Deep learning model computes directional uphill/downhill grades and proposes the NH-27/NH-54 4-lane bypass (`#a855f7` purple dashed).
10. **OR-Tools Physical Feasibility Validation**:
    - Constraint optimizer checks bridge clearance, vehicle axle weight, and delivery deadlines.
11. **Green Optimal Route Activates**:
    - Final hybrid route (`#10b981` green) is dynamically drawn on the map.
12. **Live Vehicle Transition**:
    - `MED-01` smoothly turns and transitions onto the green safe bypass corridor.
13. **ETA Updates in Real Time**:
    - Travel time drops from 620 min (blocked) to 475 min (safe arrival).
14. **Supply Continuity & Stockout Risk Recalculation**:
    - Silchar Medical College projected stockout is 8.4 hours; vehicle arrival is 7.9 hours $\implies$ **Stockout Avoided (SAFE)**.
15. **Operational Decision Recommendation**:
    - Actionable protocol generated: *"Hold low-priority construction traffic at Lumding; clear green corridor for MED-01"*.
16. **Multilingual Alert Generated**:
    - Click **`🌐 6 NER Languages`** in the header.
    - Switch across English, Hindi, Assamese (`অসমীয়া`), Bengali (`বাংলা`), Khasi (`Ka Ktien Khasi`), and Bodo (`बर'`).
17. **Multi-Channel Broadcast Dispatch**:
    - Click **`Broadcast Multi-Lang Alert`** to simulate dispatching to SMS Gateways, VHF Radio, and Field Officer mobile apps.
18. **Field Officer Evidence Upload**:
    - Click **`Field Incident`** $\to$ upload a geotagged photo $\to$ observe instant map marker placement.
19. **Open 4-Way Strategy Benchmark Tab**:
    - Click the **`AI Modes`** tab on the sidebar.
    - Inspect live delta analysis comparing Mode A (OSRM), Mode B (Context), Mode C (Neural RRNCO), and Mode D (Hybrid Final).
20. **Open SIH Audit Matrix**:
    - Click **`Audit Matrix`** in the header to view 100% verification across all 16 official components.
21. **Open Judge Pitch & Value Differentiation**:
    - Click **`Judge Pitch`** in the top navigation header.
    - Walk the evaluators through the 4-stage progression: **`Reactive → Intelligent → Action → Protected Delivery`**.
    - Review the side-by-side differentiation table, 7-role RBAC architecture, safe-hub ranking, and verified scientific benchmark evidence (LightGBM AUC=0.941, R²=0.912, OR-Tools latency 22.4ms, -145 min trip delay avoided).


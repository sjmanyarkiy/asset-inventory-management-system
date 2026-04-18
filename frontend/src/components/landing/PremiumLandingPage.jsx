import React from 'react'
import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Realtime Asset Visibility',
    description:
      'Track lifecycle status, ownership, and movement of every asset from one elegant command center.'
  },
  {
    title: 'Smart Assignment Workflow',
    description:
      'Allocate, reassign, and recover assets with full accountability and approval-friendly timelines.'
  },
  {
    title: 'Executive Reporting Suite',
    description:
      'Turn operations data into board-ready dashboards with exports that are clean and presentation-ready.'
  }
]

export default function PremiumLandingPage() {
  return (
    <main className="landing-page">
      <section className="hero-card">
        <h1>Asset Inventory Management</h1>
        <p className="hero-subtitle">
          A modern control center for IT, finance, and operations teams to manage assets with speed,
          precision, and clarity.
        </p>

        <div className="hero-actions">
          <Link className="btn btn-primary" to="/reports">
            View Reports
          </Link>
          <Link className="btn btn-secondary" to="/assets">
            Manage Assets
          </Link>
        </div>
      </section>

      <section className="features-section">
        <h2>Core Features</h2>

        <div className="features-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

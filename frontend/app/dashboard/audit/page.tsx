'use client';

import React, { useState } from 'react';
import DataTable from '@/components/DataTable';
import Badge from '@/components/Badge';
import { generateAuditLog } from '@/lib/mockData';

export default function AuditPage() {
  const [auditLog] = useState(() => generateAuditLog());
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('');

  const filteredLog = auditLog.filter((log) => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !eventFilter || log.eventType === eventFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-fadeUp">
      <div>
        <h1 className="text-3xl font-bold font-mono text-text-primary mb-2">
          Audit Trail
        </h1>
        <p className="text-text-secondary text-sm font-mono">
          Cryptographic event verification and chain integrity
        </p>
      </div>

      {/* Filters & Export */}
      <div className="card space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input flex-1 text-xs"
          />
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="form-input text-xs"
          >
            <option value="">All Events</option>
            <option value="simulation_start">Simulation Start</option>
            <option value="agent_action">Agent Action</option>
            <option value="liquidation_event">Liquidation</option>
            <option value="price_update">Price Update</option>
            <option value="cascade_trigger">Cascade</option>
          </select>
          <button className="btn accent text-xs py-2 px-4">CSV</button>
          <button className="btn accent text-xs py-2 px-4">JSON</button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card overflow-hidden">
        <DataTable
          columns={[
            { header: 'Step', accessor: 'step', className: 'font-mono text-xs font-bold w-12' },
            { header: 'Timestamp', accessor: 'timestamp', className: 'font-mono text-xs' },
            { header: 'Event Type', accessor: 'eventType', className: 'font-mono text-xs' },
            { header: 'Actor', accessor: 'actor', className: 'font-mono text-xs truncate' },
            { header: 'Description', accessor: 'description', className: 'font-mono text-xs' },
            {
              header: 'Verified',
              accessor: (row) => (
                <Badge variant={row.verified ? 'success' : 'critical'}>
                  {row.verified ? '✓' : '✗'}
                </Badge>
              ),
            },
          ]}
          data={filteredLog}
        />
      </div>

      {/* Chain Integrity */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-xs text-text-tertiary font-mono uppercase mb-2">Events Logged</div>
          <div className="text-2xl font-bold font-mono text-accent">{auditLog.length}</div>
        </div>
        <div className="card">
          <div className="text-xs text-text-tertiary font-mono uppercase mb-2">Chain Status</div>
          <div className="text-sm font-mono text-success">INTACT</div>
        </div>
        <div className="card">
          <div className="text-xs text-text-tertiary font-mono uppercase mb-2">Hash Coverage</div>
          <div className="text-2xl font-bold font-mono text-accent">100%</div>
        </div>
        <div className="card">
          <div className="text-xs text-text-tertiary font-mono uppercase mb-2">Last Verified</div>
          <div className="text-xs font-mono text-text-secondary">Just now</div>
        </div>
      </div>
    </div>
  );
}

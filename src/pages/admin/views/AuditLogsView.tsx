import type { AuditLogEntry } from '../../../models/MenuModel';

interface AuditLogsManagerProps {
  auditLogs: AuditLogEntry[];
}

export default function AuditLogsManager({ auditLogs }: AuditLogsManagerProps) {
  return (
    <div className="audit-logs-page-container">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm mb-6 box-border font-sans">
        <div className="flex items-center m-0">
          <h3 className="text-sm font-extrabold text-slate-900 m-0">Historical Stock Count Discrepancy Logs</h3>
        </div>
      </div>

      {/* Table List */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white font-sans">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Log Date</th>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Stock Item ID</th>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Item Name</th>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">System Recorded</th>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Physical Audited</th>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Difference (Discrepancy)</th>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Audited By</th>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200 w-[35%]">Auditor Notes / Remarks</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => {
                const isShort = log.discrepancy < 0;
                const isOver = log.discrepancy > 0;
                return (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                      <span className="text-xs text-slate-500 font-semibold">
                        {log.auditDate}
                      </span>
                    </td>
                    <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                      <span className="font-mono text-xs text-slate-500">
                        {log.itemId}
                      </span>
                    </td>
                    <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                      <strong className="text-slate-950 font-bold text-[14.5px]">{log.itemName}</strong>
                    </td>
                    <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                      <span className="text-xs text-slate-500 font-semibold">{log.recordedCount}</span>
                    </td>
                    <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                      <strong className="text-slate-950 font-bold">{log.physicalCount}</strong>
                    </td>
                    <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                      {isShort && (
                        <span className="text-red-600 font-bold text-[14.5px]">
                          {log.discrepancy} (Shortage)
                        </span>
                      )}
                      {isOver && (
                        <span className="text-green-600 font-bold text-[14.5px]">
                          +{log.discrepancy} (Overage)
                        </span>
                      )}
                      {log.discrepancy === 0 && (
                        <span className="text-slate-500 font-semibold text-xs">
                          Balanced
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                      <strong className="text-xs font-bold text-slate-950">{log.auditedBy}</strong>
                    </td>
                    <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                      <p className="text-xs text-slate-500 leading-relaxed m-0">
                        {log.notes || <span className="italic opacity-50">No notes provided.</span>}
                      </p>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-5 py-8 border-b border-slate-100 text-center text-sm text-slate-500 italic">
                  No physical stock audit records found. Run a physical check on inventory items to begin logging records!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

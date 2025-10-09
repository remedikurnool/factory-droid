'use client'

import { useState, useEffect } from 'react'
import { analyticsAPI } from '@/lib/api/analytics'
import type { ScheduledReport, CreateScheduledReportRequest } from '@/lib/types/analytics'
import { Calendar, Clock, Mail, Play, Trash2, Edit, Plus, FileText } from 'lucide-react'
import { format } from 'date-fns'

export default function ScheduledReportsPage() {
  const [reports, setReports] = useState<ScheduledReport[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState<CreateScheduledReportRequest>({
    name: '',
    reportType: 'SALES',
    frequency: 'DAILY',
    format: 'PDF',
    recipients: [''],
  })

  useEffect(() => {
    loadScheduledReports()
  }, [])

  const loadScheduledReports = async () => {
    try {
      setLoading(true)
      const data = await analyticsAPI.getScheduledReports()
      setReports(data)
    } catch (error) {
      console.error('Failed to load scheduled reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await analyticsAPI.createScheduledReport({
        ...formData,
        recipients: formData.recipients.filter((r) => r.trim() !== ''),
      })
      setShowCreateModal(false)
      setFormData({
        name: '',
        reportType: 'SALES',
        frequency: 'DAILY',
        format: 'PDF',
        recipients: [''],
      })
      loadScheduledReports()
    } catch (error) {
      console.error('Failed to create scheduled report:', error)
    }
  }

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await analyticsAPI.toggleScheduledReport(id, !enabled)
      loadScheduledReports()
    } catch (error) {
      console.error('Failed to toggle report:', error)
    }
  }

  const handleTrigger = async (id: string) => {
    try {
      await analyticsAPI.triggerScheduledReport(id)
      alert('Report generation triggered successfully!')
    } catch (error) {
      console.error('Failed to trigger report:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled report?')) return
    try {
      await analyticsAPI.deleteScheduledReport(id)
      loadScheduledReports()
    } catch (error) {
      console.error('Failed to delete report:', error)
    }
  }

  const addRecipient = () => {
    setFormData({ ...formData, recipients: [...formData.recipients, ''] })
  }

  const updateRecipient = (index: number, value: string) => {
    const newRecipients = [...formData.recipients]
    newRecipients[index] = value
    setFormData({ ...formData, recipients: newRecipients })
  }

  const removeRecipient = (index: number) => {
    const newRecipients = formData.recipients.filter((_, i) => i !== index)
    setFormData({ ...formData, recipients: newRecipients })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scheduled reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scheduled Reports</h1>
            <p className="text-gray-600 mt-1">Automated report generation and email delivery</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Create Scheduled Report</span>
          </button>
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scheduled Reports</h3>
            <p className="text-gray-600 mb-4">Create your first scheduled report to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Report
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          report.enabled
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {report.enabled ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                        {report.reportType}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Frequency: {report.frequency}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>Format: {report.format}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Next run: {format(new Date(report.nextRun), 'dd MMM yyyy HH:mm')}</span>
                      </div>
                      {report.lastRun && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Last run: {format(new Date(report.lastRun), 'dd MMM yyyy HH:mm')}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>Recipients:</span>
                        <div className="flex flex-wrap gap-2">
                          {report.recipients.map((recipient, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {recipient}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggle(report.id, report.enabled)}
                      className={`p-2 rounded-lg ${
                        report.enabled
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                      title={report.enabled ? 'Disable' : 'Enable'}
                    >
                      <Calendar className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleTrigger(report.id)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                      title="Trigger Now"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Create Scheduled Report</h2>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-6">
                {/* Report Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Weekly Sales Report"
                    required
                  />
                </div>

                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select
                    value={formData.reportType}
                    onChange={(e) => setFormData({ ...formData, reportType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="SALES">Sales Report</option>
                    <option value="INVENTORY">Inventory Report</option>
                    <option value="CUSTOMERS">Customer Report</option>
                    <option value="FINANCIAL">Financial Report</option>
                  </select>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>

                {/* Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="CSV">CSV</option>
                    <option value="PDF">PDF</option>
                    <option value="EXCEL">Excel</option>
                  </select>
                </div>

                {/* Recipients */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Recipients</label>
                  <div className="space-y-2">
                    {formData.recipients.map((recipient, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="email"
                          value={recipient}
                          onChange={(e) => updateRecipient(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="email@example.com"
                          required
                        />
                        {formData.recipients.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRecipient(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addRecipient}
                    className="mt-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    + Add Another Recipient
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

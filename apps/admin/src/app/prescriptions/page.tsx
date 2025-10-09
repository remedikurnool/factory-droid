'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { prescriptionAPI, orderAPI } from '@/lib/api/orders'
import type { Prescription, PrescriptionVerificationStats } from '@/lib/types/orders'
import { PrescriptionStatus } from '@/lib/types/orders'
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { format } from 'date-fns'

export default function PrescriptionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [stats, setStats] = useState<PrescriptionVerificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [selectedStatus, setSelectedStatus] = useState<PrescriptionStatus | undefined>(PrescriptionStatus.PENDING)
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [additionalDocsNote, setAdditionalDocsNote] = useState('')

  useEffect(() => {
    loadPrescriptions()
    loadStats()
  }, [page, selectedStatus])

  const loadPrescriptions = async () => {
    try {
      setLoading(true)
      const response = await prescriptionAPI.getPendingPrescriptions({
        page,
        pageSize,
        status: selectedStatus,
      })
      setPrescriptions(response.data)
      setTotal(response.total)
    } catch (error) {
      console.error('Failed to load prescriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await prescriptionAPI.getPrescriptionStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription)
    setShowModal(true)
    setRejectionReason('')
    setAdditionalDocsNote('')
  }

  const handleVerify = async (status: 'VERIFIED' | 'REJECTED') => {
    if (!selectedPrescription) return

    if (status === 'REJECTED' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    try {
      await prescriptionAPI.verifyPrescription({
        prescriptionId: selectedPrescription.id,
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
      })
      setShowModal(false)
      setSelectedPrescription(null)
      loadPrescriptions()
      loadStats()
    } catch (error) {
      console.error('Failed to verify prescription:', error)
      alert('Failed to verify prescription')
    }
  }

  const handleRequestAdditionalDocs = async () => {
    if (!selectedPrescription) return
    if (!additionalDocsNote.trim()) {
      alert('Please provide a note for additional documents')
      return
    }

    try {
      await prescriptionAPI.requestAdditionalDocuments(selectedPrescription.id, additionalDocsNote)
      setShowModal(false)
      setSelectedPrescription(null)
      loadPrescriptions()
      loadStats()
    } catch (error) {
      console.error('Failed to request additional documents:', error)
      alert('Failed to request additional documents')
    }
  }

  const getStatusColor = (status: PrescriptionStatus) => {
    switch (status) {
      case PrescriptionStatus.VERIFIED:
        return 'bg-green-100 text-green-700'
      case PrescriptionStatus.REJECTED:
        return 'bg-red-100 text-red-700'
      case PrescriptionStatus.UNDER_REVIEW:
        return 'bg-blue-100 text-blue-700'
      case PrescriptionStatus.ADDITIONAL_DOCUMENTS_REQUIRED:
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-yellow-100 text-yellow-700'
    }
  }

  const getStatusIcon = (status: PrescriptionStatus) => {
    switch (status) {
      case PrescriptionStatus.VERIFIED:
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case PrescriptionStatus.REJECTED:
        return <XCircle className="w-5 h-5 text-red-600" />
      case PrescriptionStatus.UNDER_REVIEW:
        return <Clock className="w-5 h-5 text-blue-600" />
      case PrescriptionStatus.ADDITIONAL_DOCUMENTS_REQUIRED:
        return <AlertCircle className="w-5 h-5 text-orange-600" />
      default:
        return <FileText className="w-5 h-5 text-yellow-600" />
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  if (loading && prescriptions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prescriptions...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Prescription Verification</h1>
            <p className="text-gray-600 mt-1">Review and verify uploaded prescriptions</p>
          </div>
          <button
            onClick={() => router.push('/orders')}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Orders</span>
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-5 gap-6">
            <StatsCard
              title="Pending"
              value={stats.pendingCount}
              icon={Clock}
              color="yellow"
              onClick={() => setSelectedStatus(PrescriptionStatus.PENDING)}
              active={selectedStatus === PrescriptionStatus.PENDING}
            />
            <StatsCard
              title="Under Review"
              value={stats.underReviewCount}
              icon={FileText}
              color="blue"
              onClick={() => setSelectedStatus(PrescriptionStatus.UNDER_REVIEW)}
              active={selectedStatus === PrescriptionStatus.UNDER_REVIEW}
            />
            <StatsCard
              title="Verified Today"
              value={stats.verifiedToday}
              icon={CheckCircle}
              color="green"
              onClick={() => setSelectedStatus(PrescriptionStatus.VERIFIED)}
              active={selectedStatus === PrescriptionStatus.VERIFIED}
            />
            <StatsCard
              title="Rejected Today"
              value={stats.rejectedToday}
              icon={XCircle}
              color="red"
              onClick={() => setSelectedStatus(PrescriptionStatus.REJECTED)}
              active={selectedStatus === PrescriptionStatus.REJECTED}
            />
            <StatsCard
              title="Additional Docs"
              value={stats.additionalDocsRequired}
              icon={AlertCircle}
              color="orange"
              onClick={() => setSelectedStatus(PrescriptionStatus.ADDITIONAL_DOCUMENTS_REQUIRED)}
              active={selectedStatus === PrescriptionStatus.ADDITIONAL_DOCUMENTS_REQUIRED}
            />
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedStatus || ''}
              onChange={(e) => {
                setSelectedStatus(e.target.value ? (e.target.value as PrescriptionStatus) : undefined)
                setPage(1)
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Prescriptions</option>
              {Object.values(PrescriptionStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setSelectedStatus(undefined)
                setPage(1)
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Clear Filter
            </button>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {prescriptions.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Prescriptions Found</h3>
              <p className="text-gray-600">There are no prescriptions matching the current filter</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prescription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploaded
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {prescriptions.map((prescription) => (
                      <tr key={prescription.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <FileText className="w-8 h-8 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{prescription.fileName}</p>
                              <p className="text-sm text-gray-600">
                                {prescription.fileType} • {(prescription.fileSize / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => router.push(`/orders/${prescription.orderId}`)}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            View Order
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">Customer ID: {prescription.customerId}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900">
                            {format(new Date(prescription.uploadedAt), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-xs text-gray-600">
                            {format(new Date(prescription.uploadedAt), 'HH:mm')}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(prescription.status)}
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(prescription.status)}`}>
                              {prescription.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {prescription.verifiedBy && (
                            <p className="text-xs text-gray-600 mt-1">By: {prescription.verifiedBy}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewPrescription(prescription)}
                              className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Review</span>
                            </button>
                            <button
                              onClick={() => prescriptionAPI.downloadPrescription(prescription.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} prescriptions
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Review Prescription</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Prescription Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">File Name</p>
                    <p className="font-medium text-gray-900">{selectedPrescription.fileName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">File Type</p>
                    <p className="font-medium text-gray-900">{selectedPrescription.fileType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">File Size</p>
                    <p className="font-medium text-gray-900">
                      {(selectedPrescription.fileSize / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Uploaded</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(selectedPrescription.uploadedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Current Status</p>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedPrescription.status)}
                    <span className={`px-3 py-1 rounded font-medium ${getStatusColor(selectedPrescription.status)}`}>
                      {selectedPrescription.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Prescription Preview */}
              <div className="border border-gray-300 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Prescription Preview</h4>
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Preview will be displayed here</p>
                  <button
                    onClick={() => prescriptionAPI.downloadPrescription(selectedPrescription.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Download to View
                  </button>
                </div>
              </div>

              {/* Rejection Reason Form */}
              {selectedPrescription.status === PrescriptionStatus.PENDING ||
                selectedPrescription.status === PrescriptionStatus.UNDER_REVIEW ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide reason for rejection..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Request Additional Documents (optional)
                    </label>
                    <textarea
                      value={additionalDocsNote}
                      onChange={(e) => setAdditionalDocsNote(e.target.value)}
                      placeholder="Specify what additional documents are needed..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </div>
              ) : null}

              {/* Rejection Info (if already rejected) */}
              {selectedPrescription.status === PrescriptionStatus.REJECTED && selectedPrescription.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Rejection Reason</h4>
                  <p className="text-red-700">{selectedPrescription.rejectionReason}</p>
                  {selectedPrescription.verifiedBy && (
                    <p className="text-sm text-red-600 mt-2">
                      Rejected by: {selectedPrescription.verifiedBy} on{' '}
                      {selectedPrescription.verifiedAt &&
                        format(new Date(selectedPrescription.verifiedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}
                </div>
              )}

              {/* Additional Docs Info */}
              {selectedPrescription.additionalDocumentsRequested && selectedPrescription.additionalDocumentsNote && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">Additional Documents Requested</h4>
                  <p className="text-orange-700">{selectedPrescription.additionalDocumentsNote}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              {(selectedPrescription.status === PrescriptionStatus.PENDING ||
                selectedPrescription.status === PrescriptionStatus.UNDER_REVIEW) && (
                <>
                  {additionalDocsNote.trim() && (
                    <button
                      onClick={handleRequestAdditionalDocs}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Request Additional Docs</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleVerify('REJECTED')}
                    disabled={!rejectionReason.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleVerify('VERIFIED')}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Verify & Approve</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  onClick,
  active,
}: {
  title: string
  value: number
  icon: any
  color: 'yellow' | 'blue' | 'green' | 'red' | 'orange'
  onClick?: () => void
  active?: boolean
}) {
  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <button
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-6 text-left transition-all ${
        active ? 'ring-2 ring-purple-500 ring-offset-2' : 'hover:shadow-lg'
      }`}
    >
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </button>
  )
}

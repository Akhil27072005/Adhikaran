import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { fetchCaseSummary } from "../api/api"
import AppHeader from "../components/AppHeader"
import { formatDate, formatDateTime } from "../utils/dateUtils"
import EvidenceUploadModal from "../components/EvidenceUploadModal"
import UserSuggestionPicker from "../components/UserSuggestionPicker"
import { Pencil, Upload } from "lucide-react"
import axios from 'axios'
import "../styles/caseSummary.css"
import "../styles/case-summary-edit.css"

function Badge({ children, color = "gray" }) {
  const bgClass =
    {
      green: "badge-green",
      red: "badge-red",
      yellow: "badge-yellow",
      blue: "badge-blue",
      gray: "badge-gray",
    }[color] || "badge-gray"
  return <span className={`badge-custom ${bgClass}`}>{children}</span>
}

function Field({ label, children, isEditing, editValue, onEditChange, editType = "text" }) {
  return (
    <div className="field-group">
      <div className="field-label">{label}</div>
      <div className="field-value">
        {isEditing ? (
          editType === "textarea" ? (
            <textarea
              value={editValue}
              onChange={(e) => onEditChange(e.target.value)}
              className="case-summary-edit-input"
              rows={3}
            />
          ) : (
            <input
              type={editType}
              value={editValue}
              onChange={(e) => onEditChange(e.target.value)}
              className="case-summary-edit-input"
            />
          )
        ) : (
          children
        )}
      </div>
    </div>
  )
}

function EvidenceGrid({ evidence = [] }) {
  if (!evidence.length) return <p className="text-muted">No evidence uploaded.</p>
  return (
    <div className="evidence-grid">
      {evidence.map((e) => (
        <div key={e._id} className="evidence-item">
          <div className="evidence-title">{e.title}</div>
          <div className="evidence-type">{e.fileType?.toUpperCase() || "FILE"}</div>
          <div className="evidence-description">{e.description}</div>
          <div className="evidence-footer">
            <a href={e.fileUrl} target="_blank" rel="noreferrer" className="evidence-link">
              View / Download
            </a>
            <div className="evidence-uploader">By: {e.uploadedBy?.fullName || "Unknown"}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function CaseSummary() {
  const { id } = useParams() // route param /cases/:id/summary or /cases/:id
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [saving, setSaving] = useState(false)
  const [showEvidenceModal, setShowEvidenceModal] = useState(false)

  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const role = user?.role

  // Handle profile navigation
  const handleProfile = () => {
    if (role === 'judge') navigate('/judge/profile')
    else navigate('/user/profile')
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout')
    } catch (_) {
      // ignore
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('accessToken')
      navigate('/', { replace: true })
    }
  }

  // Handle back to dashboard navigation
  const handleBackToDashboard = () => {
    if (role === 'judge') navigate('/judge-dashboard')
    else navigate('/user-dashboard')
  }

  // Handle cases navigation (for judges)
  const handleCases = () => {
    if (role === 'judge') navigate('/judge-dashboard')
    else navigate('/user-dashboard')
  }

  // Role-based user actions
  const getUserActions = () => {
    if (role === 'judge') {
      return [
        { label: 'Back to Dashboard', onClick: handleBackToDashboard },
        { label: 'Cases', onClick: handleCases }       
      ]
    } else {
      return [
        { label: 'Back to Dashboard', onClick: handleBackToDashboard }
      ]
    }
  }

  // Edit mode functions
  const handleEditToggle = () => {
    if (!isEditing) {
      // Initialize edit data with current case data
      setEditData({
        case_description: data?.case?.case_description || '',
        status: data?.case?.status || '',
        final_verdict: data?.case?.final_verdict || '',
        sentence: data?.case?.sentence || '',
        next_hearing: data?.case?.next_hearing ? new Date(data.case.next_hearing).toISOString().slice(0, 16) : '',
        witnesses: data?.case?.witnesses || []
      })
    }
    setIsEditing(!isEditing)
  }

  const handleEditFieldChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleWitnessesChange = (witnesses) => {
    setEditData(prev => ({
      ...prev,
      witnesses
    }))
  }

  const handleSaveChanges = async () => {
    setSaving(true)
    try {
      // Prepare data for sending - extract only IDs from witnesses
      const dataToSend = {
        ...editData,
        witnesses: editData.witnesses ? editData.witnesses.map(w => w._id) : []
      }
      
      const token = localStorage.getItem('token')
      const response = await axios.patch(
        `http://localhost:5000/api/cases/${id}`,
        dataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      // Refresh case data
      const updatedData = await fetchCaseSummary(id)
      setData(updatedData)
      
      // Exit edit mode
      setIsEditing(false)
      setEditData({})
      
    } catch (err) {
      console.error('Error updating case:', err)
      setError(err.response?.data?.message || 'Failed to update case')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData({})
  }

  const handleEvidenceUploadSuccess = () => {
    // Refresh case data to show new evidence
    fetchCaseSummary(id).then(updatedData => {
      setData(updatedData)
    })
  }

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchCaseSummary(id)
      .then((res) => {
        if (!mounted) return
        setData(res)
        setError(null)
      })
      .catch((err) => {
        if (!mounted) return
        console.error(err)
        setError(err.message || "Failed to load case")
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) return <div className="loading-state">Loading case summary...</div>
  if (error) return <div className="error-state">Error: {error}</div>
  if (!data) return <div className="no-data-state">No data.</div>

  const { case: c, evidence = [], mlAnalysis } = data

  // status color map
  const statusColor =
    {
      filed: "blue",
      under_review: "yellow",
      ai_analyzed: "blue",
      pre_verdict: "yellow",
      post_verdict: "green",
      closed: "green",
    }[c.status] || "gray"

  return (
    <div className="case-summary-container">
      <div className="case-summary-container-header">
        <AppHeader 
          title={role === 'judge' ? 'Adhikaran | Judge Portal' : 'Adhikaran | User Portal'}
          userActions={getUserActions()}
        />
      </div>
      <div className="case-header">
        <div>
          <h1 className="case-title">
            {c.case_title}
            {role === 'judge' && (
              <button
                className="case-summary-edit-toggle"
                onClick={handleEditToggle}
                disabled={saving}
                title={isEditing ? 'Cancel Edit' : 'Edit Case'}
              >
                <Pencil size={16} />
                {isEditing && <span style={{ marginLeft: '6px' }}>Cancel</span>}
              </button>
            )}
          </h1>
        </div>

        <div className="case-badges">
          <Badge color={statusColor}>{c.status.replace("_", " ").toUpperCase()}</Badge>
          <Badge color="blue">{c.case_type?.toUpperCase()}</Badge>
        </div>
      </div>


      {/* Main content grid */}
      <div className="main-grid">
        {/* Left: Description + AI/ML */}
        <div className="content-section">
          <div className="card-custom">
            <h2 className="card-title">Case Description</h2>
            {isEditing && role === 'judge' ? (
              <textarea
                value={editData.case_description || ''}
                onChange={(e) => handleEditFieldChange('case_description', e.target.value)}
                className="case-summary-edit-input"
                rows={4}
                placeholder="Enter case description..."
              />
            ) : (
              <div className="case-description">{c.case_description}</div>
            )}
            {c.requirements && <div className="field-value text-muted mt-3">Requirements: {c.requirements}</div>}
            {c.notes && <div className="field-value text-muted mt-2">Judge notes: {c.notes}</div>}
          </div>

          {/* Concerned Parties & Witnesses */}
          <div className="card-custom">
            <div className="parties-grid">
              <div>
                <h3 className="card-subtitle">Concerned Parties</h3>
                <div className="party-info mb-3">
                  <div className="party-name">
                    Filer: {c.filer?.fullName} {c.filer?.city ? `(${c.filer.city})` : ""}
                  </div>
                  <div className="party-contact">
                    {c.filer?.email} • {c.filer?.phone}
                  </div>
                </div>
                <div className="party-info">
                  <div className="party-name">
                    Defendant: {c.defendant?.fullName} {c.defendant?.city ? `(${c.defendant.city})` : ""}
                  </div>
                  <div className="party-contact">
                    {c.defendant?.email} • {c.defendant?.phone}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="card-subtitle">Witnesses</h3>
                {isEditing && role === 'judge' ? (
                  <UserSuggestionPicker
                    selectedUsers={editData.witnesses || []}
                    onUsersChange={handleWitnessesChange}
                    placeholder="Search for witnesses..."
                    maxSelections={10}
                  />
                ) : (
                  c.witnesses && c.witnesses.length ? (
                    <ul className="witnesses-list">
                      {c.witnesses.map((w, i) => (
                        <li key={w._id || i}>
                          <div className="witness-name">
                            <strong>{w.fullName}</strong>
                          </div>
                          <div className="witness-contact">
                            {w.email} • {w.phone}
                          </div>
                          {w.city && (
                            <div className="witness-location">
                              {w.city}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-muted">No witnesses recorded.</div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* AI Summary & ML Judgement */}
          <div className="analysis-section">
            <h3 className="card-title">AI Summary</h3>
            <div className="field-value">{mlAnalysis?.summary || "No AI summary available."}</div>

            <div className="mt-4">
              <h4 className="card-subtitle">ML Judgement</h4>
              {mlAnalysis?.ml_prediction ? (
                <div className="ml-prediction">
                  <div className="field-value">
                    <strong>Prediction:</strong> {mlAnalysis.ml_prediction.label}
                  </div>
                  <div className="field-value">
                    <strong>Probability:</strong>{" "}
                    {(mlAnalysis.ml_prediction.details?.probability ?? mlAnalysis.ml_prediction.details?.prob) || "N/A"}
                  </div>
                  <div className="field-value">
                    <strong>Confidence:</strong> {mlAnalysis.ml_prediction.details?.confidence ?? "N/A"}
                  </div>
                  {mlAnalysis.ml_prediction.details?.reasoning && (
                    <div className="reasoning-box">{mlAnalysis.ml_prediction.details.reasoning}</div>
                  )}
                  {mlAnalysis.ml_prediction.details?.key_points && (
                    <ul className="mt-3">
                      {mlAnalysis.ml_prediction.details.key_points.map((kp, i) => (
                        <li key={i}>{kp}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="text-muted">No ML judgement available.</div>
              )}
            </div>
          </div>

          {/* Final Verdict & Sentence - Always show for judges */}
          {role === 'judge' && (
            <div className="verdict-section">
              <h3 className="card-title">Final Verdict & Sentence</h3>
              <Field 
                label="Final Verdict"
                isEditing={isEditing && role === 'judge'}
                editValue={editData.final_verdict || c.final_verdict || ''}
                onEditChange={(value) => handleEditFieldChange('final_verdict', value)}
                editType="textarea"
              >
                {c.final_verdict || "—"}
              </Field>
              <Field 
                label="Sentence / Settlement"
                isEditing={isEditing && role === 'judge'}
                editValue={editData.sentence || c.sentence || ''}
                onEditChange={(value) => handleEditFieldChange('sentence', value)}
                editType="textarea"
              >
                {c.sentence || "—"}
              </Field>
              {c.judgement_date && (
                <div className="text-muted">Judgement date: {formatDate(c.judgement_date)}</div>
              )}
            </div>
          )}
        </div>

        {/* Right: Sidebar / Evidence */}
        <div className="sidebar-section">
          <div className="card-custom">
            <h3 className="card-subtitle">Case Info</h3>
            <div className="field-value">
              <div>
                <strong>Case ID:</strong> {c.readable_case_id || c.readableCaseId || c._id}
              </div>
              <div>
                <strong>Assigned Judge:</strong> {c.assignedJudge?.fullName} ({c.assignedJudge?.court})
              </div>
              <div>
                <strong>Filing Date:</strong> {formatDate(c.filing_date)}
              </div>
              <div>
                <strong>Case Status:</strong> 
                {isEditing && role === 'judge' ? (
                  <select
                    value={editData.status || c.status}
                    onChange={(e) => handleEditFieldChange('status', e.target.value)}
                    className="case-summary-edit-input"
                    style={{ marginLeft: '8px', width: 'auto' }}
                  >
                    <option value="filed">Filed</option>
                    <option value="draft">Draft</option>
                    <option value="under_review">Under Review</option>
                    <option value="ai_analyzed">AI Analyzed</option>
                    <option value="pre_verdict">Pre Verdict</option>
                    <option value="post_verdict">Post Verdict</option>
                    <option value="closed">Closed</option>
                  </select>
                ) : (
                  <span>{c.status}</span>
                )}
              </div>
              <div>
                <strong>Next Hearing:</strong> 
                {isEditing && role === 'judge' ? (
                  <input
                    type="datetime-local"
                    value={editData.next_hearing || (c.next_hearing ? new Date(c.next_hearing).toISOString().slice(0, 16) : '')}
                    onChange={(e) => handleEditFieldChange('next_hearing', e.target.value)}
                    className="case-summary-edit-input"
                    style={{ marginLeft: '8px', width: 'auto' }}
                  />
                ) : (
                  c.next_hearing ? formatDate(c.next_hearing) : 'TBD'
                )}
              </div>
            </div>
          </div>

          <div className="card-custom">
            <h3 className="card-subtitle">
              Evidence Files
              {isEditing && role === 'judge' && (
                <button
                  className="case-summary-edit-toggle"
                  onClick={() => setShowEvidenceModal(true)}
                  title="Add Evidence"
                  style={{ marginLeft: '8px' }}
                >
                  <Upload size={16} />
                </button>
              )}
            </h3>
            <EvidenceGrid evidence={evidence} />
          </div>
        </div>
      </div>

      {/* Save/Cancel Actions - Only show when editing */}
      {isEditing && role === 'judge' && (
        <div className="case-summary-edit-actions" style={{ marginTop: '24px', padding: '16px', borderTop: '1px solid #e5e5e5' }}>
          <button
            type="button"
            className="case-summary-edit-cancel-btn"
            onClick={handleCancelEdit}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="case-summary-edit-save-btn"
            onClick={handleSaveChanges}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Evidence Upload Modal */}
      {showEvidenceModal && (
        <EvidenceUploadModal
          isOpen={showEvidenceModal}
          onClose={() => setShowEvidenceModal(false)}
          caseId={id}
          caseTitle={c.case_title}
          onSuccess={handleEvidenceUploadSuccess}
        />
      )}
    </div>
  )
}

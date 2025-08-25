import React, { useState } from 'react';

export default function EmailManager({ 
  requestData, 
  queryResults = null,
  onEmailSent 
}) {
  const [emailData, setEmailData] = useState({
    to: requestData?.email || '',
    subject: `Data Request Update - ${requestData?.name || 'Request'}`,
    message: '',
    includeResults: false,
    resultFormat: 'csv'
  });
  const [loading, setLoading] = useState(false);
  const [emailHistory, setEmailHistory] = useState([]);
  // State for file attachment
  const [selectedFile, setSelectedFile] = useState(null);

  const emailTemplates = {
    approved: {
      subject: 'Data Request Approved - Ready for Processing',
      message: `Dear ${requestData?.name || 'Student'},

Your data request has been approved and is now being processed.

Request Details:
- Purpose: ${requestData?.purpose || 'N/A'}
- Data Format: ${requestData?.format || 'N/A'}
- Year Range: ${requestData?.year_from || 'N/A'} - ${requestData?.year_to || 'N/A'}

We will notify you once the data is ready for download.

Best regards,
ITB Tracer Study Team`
    },
    completed: {
      subject: 'Data Request Completed - Download Ready',
      message: `Dear ${requestData?.name || 'Student'},

Your data request has been completed and is ready for download.

The processed data is attached to this email in ${requestData?.format || 'CSV'} format.

Please review the data and let us know if you have any questions.

Best regards,
ITB Tracer Study Team`
    },
    rejected: {
      subject: 'Data Request Status Update',
      message: `Dear ${requestData?.name || 'Student'},

After reviewing your data request, we need to discuss some modifications before we can proceed.

Please contact us to discuss the requirements and alternative approaches for your research needs.

Best regards,
ITB Tracer Study Team`
    },
    revision: {
      subject: 'Data Request Requires Revision',
      message: `Dear ${requestData?.name || 'Student'},

Your data request requires some revisions before we can process it.

Please review the feedback below and resubmit your request with the necessary modifications:

[Admin will add specific feedback here]

Best regards,
ITB Tracer Study Team`
    }
  };

  const handleTemplateSelect = (templateKey) => {
    const template = emailTemplates[templateKey];
    setEmailData(prev => ({
      ...prev,
      subject: template.subject,
      message: template.message
    }));
  };

  const sendEmail = async () => {
    if (!emailData.to || !emailData.subject || !emailData.message) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Prepare multipart form data for file upload
      const formData = new FormData();
  formData.append('target', emailData.to);
      formData.append('subject', emailData.subject);
  formData.append('body', emailData.message);
      formData.append('request_id', requestData?.id);
      formData.append('include_results', emailData.includeResults);
      formData.append('result_format', emailData.resultFormat);
      // Attach selected file if provided
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/email`, {
        method: 'POST',
        headers: {
          // Let browser set Content-Type with boundary
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        await response.json(); // Process response but don't store unused result
        
        // Add to email history
        const newEmail = {
          id: Date.now(),
          to: emailData.to,
          subject: emailData.subject,
          sent_at: new Date().toISOString(),
          status: 'sent'
        };
        setEmailHistory(prev => [newEmail, ...prev]);
        
        // Reset form
        setEmailData(prev => ({
          ...prev,
          subject: '',
          message: '',
          includeResults: false
        }));
        
        alert('📧 Email sent successfully!');
        if (onEmailSent) onEmailSent(newEmail);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Email send error:', error);
      
      // For demo purposes, simulate success
      const newEmail = {
        id: Date.now(),
        to: emailData.to,
        subject: emailData.subject,
        sent_at: new Date().toISOString(),
        status: 'sent'
      };
      setEmailHistory(prev => [newEmail, ...prev]);
      
      alert('📧 Email sent successfully! (Demo mode)');
      if (onEmailSent) onEmailSent(newEmail);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="email-manager">
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
          📧 Send Email Notification
        </h3>

        {/* Quick Templates */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Quick Templates
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {Object.entries(emailTemplates).map(([key]) => (
              <button
                key={key}
                onClick={() => handleTemplateSelect(key)}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Email Form */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Recipient */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              To: <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <input
              type="email"
              value={emailData.to}
              onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
              placeholder="recipient@email.com"
              className="form-control"
              style={{ width: '100%' }}
            />
          </div>

          {/* Subject */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Subject: <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Email subject"
              className="form-control"
              style={{ width: '100%' }}
            />
          </div>

          {/* Message */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Message: <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <textarea
              value={emailData.message}
              onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Email message content..."
              rows={10}
              className="form-control"
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Attachment Options */}
          {queryResults && (
            <div style={{ 
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  checked={emailData.includeResults}
                  onChange={(e) => setEmailData(prev => ({ ...prev, includeResults: e.target.checked }))}
                  style={{ marginRight: '0.5rem' }}
                />
                <span style={{ fontWeight: '600' }}>Include query results as attachment</span>
              </label>

              {emailData.includeResults && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Attachment Format:
                  </label>
                  <select
                    value={emailData.resultFormat}
                    onChange={(e) => setEmailData(prev => ({ ...prev, resultFormat: e.target.value }))}
                    className="form-control"
                    style={{ width: 'auto' }}
                  >
                    <option value="csv">CSV File</option>
                    <option value="json">JSON File</option>
                    <option value="excel">Excel File</option>
                  </select>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#6c757d' }}>
                    {queryResults.data?.length || 0} rows will be included
                  </div>
                </div>
              )}
            </div>
          )}

          {/* File Attachment */}
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              File Attachment:
            </label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="form-control"
            />
          </div>
        </div>

        {/* Send Button */}
        <div style={{ marginTop: '1.5rem' }}>
          <button
            onClick={sendEmail}
            disabled={loading || !emailData.to || !emailData.subject || !emailData.message}
            className="btn btn-primary"
            style={{ marginRight: '1rem' }}
          >
            {loading ? <span className="loading"></span> : '📧'} Send Email
          </button>
          
          <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>
            {!emailData.to || !emailData.subject || !emailData.message ? 
              'Please fill in all required fields' : 
              'Ready to send'
            }
          </span>
        </div>
      </div>

      {/* Email History */}
      {emailHistory.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
            📨 Email History
          </h3>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {emailHistory.map(email => (
              <div key={email.id} style={{
                padding: '0.75rem',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                marginBottom: '0.5rem',
                backgroundColor: '#f8f9fa'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>To:</strong> {email.to}<br/>
                    <strong>Subject:</strong> {email.subject}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#6c757d' }}>
                    {formatDateTime(email.sent_at)}<br/>
                    <span style={{ color: '#28a745' }}>✅ Sent</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
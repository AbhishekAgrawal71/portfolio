import React, { useState } from 'react';
import { Copy, Check, Settings, X, PlusCircle, AlertCircle } from 'lucide-react';
import './AdminHelper.css';

export const AdminHelper = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('project');
  const [copied, setCopied] = useState(false);

  // Form states
  const [projectData, setProjectData] = useState({
    id: '',
    title: '',
    description: '',
    longDescription: '',
    technologies: '',
    category: 'Machine Learning',
    featured: false,
    github: '',
    liveDemo: '',
    date: '2026',
    image: '',
  });

  const [certData, setCertData] = useState({
    id: '',
    title: '',
    issuer: '',
    date: '',
    credentialUrl: '',
    pdf: '',
    image: '',
    description: '',
  });

  const [expData, setExpData] = useState({
    id: '',
    role: '',
    company: '',
    duration: '',
    location: 'Remote',
    description: '',
    responsibilities: '',
    technologies: '',
  });

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateProjectSnippet = () => {
    const techs = projectData.technologies
      ? projectData.technologies.split(',').map((t) => `"${t.trim()}"`).join(', ')
      : '[]';

    return `  {
    id: "${projectData.id || projectData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}",
    title: "${projectData.title}",
    description: "${projectData.description.replace(/"/g, '\\"')}",
    longDescription: "${(projectData.longDescription || projectData.description).replace(/"/g, '\\"')}",
    technologies: [${techs}],
    image: "${projectData.image}",
    github: "${projectData.github}",
    liveDemo: "${projectData.liveDemo}",
    featured: ${projectData.featured},
    category: "${projectData.category}",
    date: "${projectData.date || new Date().getFullYear()}",
  },`;
  };

  const generateCertSnippet = () => {
    return `  {
    id: "${certData.id || certData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}",
    title: "${certData.title}",
    issuer: "${certData.issuer}",
    date: "${certData.date}",
    credentialUrl: "${certData.credentialUrl}",
    pdf: "${certData.pdf}",
    image: "${certData.image}",
    description: "${certData.description.replace(/"/g, '\\"')}",
  },`;
  };

  const generateExpSnippet = () => {
    const resps = expData.responsibilities
      ? expData.responsibilities.split('\n').filter(Boolean).map((r) => `      "${r.trim()}",`).join('\n')
      : '';
    const techs = expData.technologies
      ? expData.technologies.split(',').map((t) => `"${t.trim()}"`).join(', ')
      : '[]';

    return `  {
    id: "${expData.id || expData.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}",
    role: "${expData.role}",
    company: "${expData.company}",
    duration: "${expData.duration}",
    location: "${expData.location}",
    description: "${expData.description.replace(/"/g, '\\"')}",
    responsibilities: [
${resps}
    ],
    technologies: [${techs}],
  },`;
  };

  return (
    <>
      <button
        className="admin-toggle-btn"
        onClick={() => setIsOpen(true)}
        title="Open Data Snippet Generator"
        aria-label="Open portfolio data generator"
      >
        <Settings size={18} />
        <span>Data Helper</span>
      </button>

      {isOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <PlusCircle size={20} />
                <h2>Portfolio Data Generator</h2>
              </div>
              <button
                className="admin-modal-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-persistence-notice">
              <AlertCircle size={18} />
              <div>
                <strong>Zero fake persistence note:</strong> Because this portfolio is a static React site built for fast, secure, free hosting (GitHub Pages / Vercel), source files in <code>src/data/</code> are your true source of truth. Use this generator to easily create error-free JavaScript objects to paste into your data files!
              </div>
            </div>

            <div className="admin-tabs">
              <button
                className={`admin-tab ${activeTab === 'project' ? 'active' : ''}`}
                onClick={() => setActiveTab('project')}
              >
                Add Project
              </button>
              <button
                className={`admin-tab ${activeTab === 'cert' ? 'active' : ''}`}
                onClick={() => setActiveTab('cert')}
              >
                Add Certificate
              </button>
              <button
                className={`admin-tab ${activeTab === 'exp' ? 'active' : ''}`}
                onClick={() => setActiveTab('exp')}
              >
                Add Experience
              </button>
            </div>

            <div className="admin-modal-body">
              {activeTab === 'project' && (
                <div className="admin-form">
                  <div className="admin-form-group">
                    <label>Project Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Placement Prediction Model"
                      value={projectData.title}
                      onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Category *</label>
                      <input
                        type="text"
                        placeholder="e.g. Machine Learning, Web Development, Python"
                        value={projectData.category}
                        onChange={(e) => setProjectData({ ...projectData, category: e.target.value })}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Technologies (comma separated)</label>
                      <input
                        type="text"
                        placeholder="Python, Scikit-learn, Pandas"
                        value={projectData.technologies}
                        onChange={(e) => setProjectData({ ...projectData, technologies: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="admin-form-group">
                    <label>Short Description *</label>
                    <textarea
                      rows={2}
                      placeholder="Concise overview for the card..."
                      value={projectData.description}
                      onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>GitHub URL (optional)</label>
                      <input
                        type="url"
                        placeholder="https://github.com/AbhishekAgrawal71/repo"
                        value={projectData.github}
                        onChange={(e) => setProjectData({ ...projectData, github: e.target.value })}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Live Demo URL (optional)</label>
                      <input
                        type="url"
                        placeholder="https://your-demo.vercel.app"
                        value={projectData.liveDemo}
                        onChange={(e) => setProjectData({ ...projectData, liveDemo: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Screenshot Image Path (optional)</label>
                      <input
                        type="text"
                        placeholder="/projects/my-project.png"
                        value={projectData.image}
                        onChange={(e) => setProjectData({ ...projectData, image: e.target.value })}
                      />
                    </div>
                    <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                      <input
                        type="checkbox"
                        id="featured"
                        checked={projectData.featured}
                        onChange={(e) => setProjectData({ ...projectData, featured: e.target.checked })}
                      />
                      <label htmlFor="featured" style={{ cursor: 'pointer' }}>Mark as Featured Project</label>
                    </div>
                  </div>

                  <div className="admin-output-section">
                    <div className="admin-output-header">
                      <span>Paste into <code>src/data/projects.js</code>:</span>
                      <button
                        className="admin-copy-btn"
                        onClick={() => handleCopy(generateProjectSnippet())}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy Snippet'}
                      </button>
                    </div>
                    <pre className="admin-code-preview"><code>{generateProjectSnippet()}</code></pre>
                  </div>
                </div>
              )}

              {activeTab === 'cert' && (
                <div className="admin-form">
                  <div className="admin-form-group">
                    <label>Certificate Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Deep Learning Specialization"
                      value={certData.title}
                      onChange={(e) => setCertData({ ...certData, title: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Issuer / Organization *</label>
                      <input
                        type="text"
                        placeholder="e.g. Coursera / DeepLearning.AI"
                        value={certData.issuer}
                        onChange={(e) => setCertData({ ...certData, issuer: e.target.value })}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Issue Date</label>
                      <input
                        type="text"
                        placeholder="e.g. 2026 or March 2026"
                        value={certData.date}
                        onChange={(e) => setCertData({ ...certData, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Credential URL</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={certData.credentialUrl}
                        onChange={(e) => setCertData({ ...certData, credentialUrl: e.target.value })}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>PDF Path in public folder</label>
                      <input
                        type="text"
                        placeholder="/certificates/my-cert.pdf"
                        value={certData.pdf}
                        onChange={(e) => setCertData({ ...certData, pdf: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="admin-form-group">
                    <label>Description</label>
                    <textarea
                      rows={2}
                      placeholder="Topics covered..."
                      value={certData.description}
                      onChange={(e) => setCertData({ ...certData, description: e.target.value })}
                    />
                  </div>

                  <div className="admin-output-section">
                    <div className="admin-output-header">
                      <span>Paste into <code>src/data/certificates.js</code>:</span>
                      <button
                        className="admin-copy-btn"
                        onClick={() => handleCopy(generateCertSnippet())}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy Snippet'}
                      </button>
                    </div>
                    <pre className="admin-code-preview"><code>{generateCertSnippet()}</code></pre>
                  </div>
                </div>
              )}

              {activeTab === 'exp' && (
                <div className="admin-form">
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Role / Job Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Software Engineer Intern"
                        value={expData.role}
                        onChange={(e) => setExpData({ ...expData, role: e.target.value })}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Company / Organization *</label>
                      <input
                        type="text"
                        placeholder="e.g. Google, Weazy"
                        value={expData.company}
                        onChange={(e) => setExpData({ ...expData, company: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Duration *</label>
                      <input
                        type="text"
                        placeholder="e.g. May 2027 - August 2027"
                        value={expData.duration}
                        onChange={(e) => setExpData({ ...expData, duration: e.target.value })}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Remote, Bangalore, India"
                        value={expData.location}
                        onChange={(e) => setExpData({ ...expData, location: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="admin-form-group">
                    <label>Responsibilities (one bullet per line)</label>
                    <textarea
                      rows={3}
                      placeholder="Built microservices using Golang&#10;Reduced API latency by 25%&#10;Collaborated with core engineering team"
                      value={expData.responsibilities}
                      onChange={(e) => setExpData({ ...expData, responsibilities: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Technologies (comma separated)</label>
                    <input
                      type="text"
                      placeholder="React, Node.js, PostgreSQL"
                      value={expData.technologies}
                      onChange={(e) => setExpData({ ...expData, technologies: e.target.value })}
                    />
                  </div>

                  <div className="admin-output-section">
                    <div className="admin-output-header">
                      <span>Paste into <code>src/data/experience.js</code>:</span>
                      <button
                        className="admin-copy-btn"
                        onClick={() => handleCopy(generateExpSnippet())}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy Snippet'}
                      </button>
                    </div>
                    <pre className="admin-code-preview"><code>{generateExpSnippet()}</code></pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHelper;

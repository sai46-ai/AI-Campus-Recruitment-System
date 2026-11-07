import React from 'react';
import { Settings, Eye, CheckCircle2, Plus } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Resume } from '../../../shared/types';

interface ResumeSectionViewerProps {
  activeSection: string;
  resume: Resume;
  onEdit: (section: string, data: any) => void;
}

export const ResumeSectionViewer: React.FC<ResumeSectionViewerProps> = ({
  activeSection,
  resume,
  onEdit,
}) => {
  const personal = {
    name: resume.personalInfo?.name || resume.parsedData?.name || '',
    email: resume.personalInfo?.email || resume.parsedData?.email || '',
    phone: resume.personalInfo?.phone || resume.parsedData?.phone || '',
    location: resume.personalInfo?.location || '',
    linkedin: resume.personalInfo?.linkedin || '',
    github: resume.personalInfo?.github || '',
    portfolio: resume.personalInfo?.portfolio || '',
    summary: resume.personalInfo?.summary || resume.parsedData?.summary || '',
  };

  return (
    <div className="space-y-4">
      {/* Personal Info */}
      {activeSection === 'personal' && (
        <Card className="p-6 bg-tideglass-surface border border-[#D4DED3]">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#D4DED3]">
            <div>
              <h2 className="text-lg font-bold text-[#344942] font-headline">Personal &amp; Contact Details</h2>
              <p className="text-xs text-[#516861]">Primary identity and portfolio links displayed at the top of your resume</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit('personal', personal)}
            >
              <Settings className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Edit Personal Info
            </Button>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3.5 rounded-xl bg-tideglass-surface border border-[#D4DED3]">
              <dt className="text-xs font-mono uppercase text-[#516861]">Full Name</dt>
              <dd className="font-semibold text-[#344942] mt-0.5">
                {personal.name || 'Not provided'}
              </dd>
            </div>
            <div className="p-3.5 rounded-xl bg-tideglass-surface border border-[#D4DED3]">
              <dt className="text-xs font-mono uppercase text-[#516861]">Email Address</dt>
              <dd className="font-semibold text-[#344942] mt-0.5">
                {personal.email || 'Not provided'}
              </dd>
            </div>
            <div className="p-3.5 rounded-xl bg-tideglass-surface border border-[#D4DED3]">
              <dt className="text-xs font-mono uppercase text-[#516861]">Phone</dt>
              <dd className="font-semibold text-[#344942] mt-0.5">
                {personal.phone || 'Not provided'}
              </dd>
            </div>
            <div className="p-3.5 rounded-xl bg-tideglass-surface border border-[#D4DED3]">
              <dt className="text-xs font-mono uppercase text-[#516861]">Location</dt>
              <dd className="font-semibold text-[#344942] mt-0.5">
                {personal.location || 'Not provided'}
              </dd>
            </div>
            <div className="p-3.5 rounded-xl bg-tideglass-surface border border-[#D4DED3]">
              <dt className="text-xs font-mono uppercase text-[#516861]">LinkedIn URL</dt>
              <dd className="font-semibold text-[#1E6091] truncate mt-0.5">
                {personal.linkedin || 'Not provided'}
              </dd>
            </div>
            <div className="p-3.5 rounded-xl bg-tideglass-surface border border-[#D4DED3]">
              <dt className="text-xs font-mono uppercase text-[#516861]">GitHub / Portfolio</dt>
              <dd className="font-semibold text-[#1E6091] truncate mt-0.5">
                {personal.github || personal.portfolio || 'Not provided'}
              </dd>
            </div>
            <div className="sm:col-span-2 p-4 rounded-xl bg-tideglass-surface border border-[#D4DED3]">
              <dt className="text-xs font-mono uppercase text-[#516861] mb-1">Professional Summary</dt>
              <dd className="text-[#344942] whitespace-pre-wrap leading-relaxed">
                {personal.summary || 'Add a concise summary highlighting your core engineering strengths and career goals.'}
              </dd>
            </div>
          </dl>
        </Card>
      )}

      {/* Education */}
      {activeSection === 'education' && (
        <Card className="p-6 bg-tideglass-surface border border-[#D4DED3]">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#D4DED3]">
            <div>
              <h2 className="text-lg font-bold text-[#344942] font-headline">Education &amp; Academic Credentials</h2>
              <p className="text-xs text-[#516861]">University degrees, coursework, and cumulative GPA</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit('education', resume.education || [])}
            >
              <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
              Manage Education
            </Button>
          </div>
          {(resume.education?.length ?? 0) > 0 ? (
            <div className="space-y-3">
              {resume.education?.map((edu, i) => (
                <div
                  key={i}
                  className="p-4 bg-tideglass-surface rounded-xl border border-[#D4DED3]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-[#344942]">{edu.degree}</p>
                      <p className="text-[#1E6091] text-sm">{edu.institution}</p>
                      <p className="text-xs text-[#516861] mt-1">
                        {edu.startDate || 'Start'} – {edu.endDate || 'Present'}
                        {edu.fieldOfStudy ? ` • ${edu.fieldOfStudy}` : ''}
                      </p>
                      {edu.gpa && (
                        <p className="text-xs font-mono text-[#92400E] mt-1">CGPA / GPA: {edu.gpa}</p>
                      )}
                    </div>
                    <Badge variant="info" size="sm">
                      {edu.type || 'Degree'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 rounded-xl bg-[#FFFDF7]/80 border border-dashed border-[#D4DED3]">
              <p className="text-[#516861] text-sm mb-3">No education entries added yet.</p>
              <Button variant="primary" size="sm" onClick={() => onEdit('education', [])}>
                Add Education Entry
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Experience */}
      {activeSection === 'experience' && (
        <Card className="p-6 bg-tideglass-surface border border-[#D4DED3]">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#D4DED3]">
            <div>
              <h2 className="text-lg font-bold text-[#344942] font-headline">Internships &amp; Work Experience</h2>
              <p className="text-xs text-[#516861]">Industry internships, research assistantships, and engineering roles</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit('experience', resume.experience || [])}
            >
              <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
              Manage Experience
            </Button>
          </div>
          {(resume.experience?.length ?? 0) > 0 ? (
            <div className="space-y-3">
              {resume.experience?.map((exp, i) => (
                <div
                  key={i}
                  className="p-4 bg-tideglass-surface rounded-xl border border-[#D4DED3]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-[#344942]">{exp.title}</p>
                      <p className="text-[#0A7D6E] text-sm font-medium">{exp.company}</p>
                      <p className="text-xs text-[#516861] mt-0.5">
                        {exp.startDate || 'Start'} – {exp.endDate || 'Present'}
                        {exp.location ? ` • ${exp.location}` : ''}
                      </p>
                      {exp.description && exp.description.length > 0 && (
                        <ul className="mt-2.5 space-y-1 text-sm text-[#344942]">
                          {exp.description.map((d, j) => (
                            <li key={j} className="flex items-start space-x-2">
                              <span className="text-[#0A7D6E]">•</span>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Badge variant="default" size="sm">
                      {exp.type || 'Internship'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 rounded-xl bg-[#FFFDF7]/80 border border-dashed border-[#D4DED3]">
              <p className="text-[#516861] text-sm mb-3">No work experience entries added yet.</p>
              <Button variant="primary" size="sm" onClick={() => onEdit('experience', [])}>
                Add Experience Entry
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Projects */}
      {activeSection === 'projects' && (
        <Card className="p-6 bg-tideglass-surface border border-[#D4DED3]">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#D4DED3]">
            <div>
              <h2 className="text-lg font-bold text-[#344942] font-headline">Technical Projects</h2>
              <p className="text-xs text-[#516861]">Key academic, open-source, and full-stack engineering projects</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit('projects', resume.projects || [])}
            >
              <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
              Manage Projects
            </Button>
          </div>
          {(resume.projects?.length ?? 0) > 0 ? (
            <div className="space-y-3">
              {resume.projects?.map((proj, i) => (
                <div
                  key={i}
                  className="p-4 bg-tideglass-surface rounded-xl border border-[#D4DED3]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-[#344942]">{proj.name}</p>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono text-[#2879AD] hover:underline"
                      >
                        <span>Repository / Demo</span>
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-[#344942] mt-1.5 leading-relaxed">{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {proj.technologies.map((t, j) => (
                        <Badge key={j} variant="info" size="sm">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 rounded-xl bg-[#FFFDF7]/80 border border-dashed border-[#D4DED3]">
              <p className="text-[#516861] text-sm mb-3">No technical projects listed yet.</p>
              <Button variant="primary" size="sm" onClick={() => onEdit('projects', [])}>
                Add Project
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Skills */}
      {activeSection === 'skills' && (
        <Card className="p-6 bg-tideglass-surface border border-[#D4DED3]">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#D4DED3]">
            <div>
              <h2 className="text-lg font-bold text-[#344942] font-headline">Technical Skills Taxonomy</h2>
              <p className="text-xs text-[#516861]">Categorized skills matched against campus recruitment drive requirements</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                onEdit(
                  'skills',
                  Object.keys(resume.skills || {}).length > 0
                    ? resume.skills
                    : { Core: resume.parsedData?.skills || [] }
                )
              }
            >
              <Settings className="w-4 h-4 mr-1" aria-hidden="true" />
              Edit Skills
            </Button>
          </div>
          <div className="space-y-4">
            {Object.entries(
              Object.keys(resume.skills || {}).length > 0
                ? resume.skills!
                : resume.parsedData?.skills?.length
                ? { 'Extracted Competencies': resume.parsedData.skills }
                : {}
            ).map(([category, skills]) => (
              <div key={category} className="p-4 rounded-xl bg-tideglass-surface border border-[#D4DED3]">
                <h4 className="text-xs font-semibold text-[#92400E] mb-2">
                  {category}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(skills) ? (
                    skills.map((s, i) => (
                      <Badge key={i} variant="success" size="sm">
                        {s}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="success" size="sm">
                      {String(skills)}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {Object.keys(resume.skills || {}).length === 0 &&
              (!resume.parsedData?.skills || resume.parsedData.skills.length === 0) && (
                <div className="text-center py-8 rounded-xl bg-[#FFFDF7]/80 border border-dashed border-[#D4DED3]">
                  <p className="text-[#516861] text-sm mb-3">No skills listed yet.</p>
                  <Button variant="primary" size="sm" onClick={() => onEdit('skills', { 'Core Engineering': [] })}>
                    Add Technical Skills
                  </Button>
                </div>
              )}
          </div>
        </Card>
      )}

      {/* Certifications */}
      {activeSection === 'certifications' && (
        <Card className="p-6 bg-tideglass-surface border border-[#D4DED3]">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#D4DED3]">
            <div>
              <h2 className="text-lg font-bold text-[#344942] font-headline">Certifications &amp; Licenses</h2>
              <p className="text-xs text-[#516861]">Verified cloud, security, and software engineering credentials</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit('certifications', resume.certifications || [])}
            >
              <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
              Manage Certifications
            </Button>
          </div>
          {(resume.certifications?.length ?? 0) > 0 ? (
            <div className="space-y-3">
              {resume.certifications?.map((cert, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-tideglass-surface rounded-xl border border-[#D4DED3]"
                >
                  <div>
                    <p className="font-bold text-[#344942]">{cert.name}</p>
                    <p className="text-xs text-[#516861] mt-0.5">
                      {cert.issuer || 'Issuing Organization'} {cert.date ? `• ${cert.date}` : ''}
                    </p>
                  </div>
                  {cert.link && (
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-[#2879AD] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Verify</span>
                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 rounded-xl bg-[#FFFDF7]/80 border border-dashed border-[#D4DED3]">
              <p className="text-[#516861] text-sm mb-3">No certifications listed yet.</p>
              <Button variant="primary" size="sm" onClick={() => onEdit('certifications', [])}>
                Add Certification
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Achievements */}
      {activeSection === 'achievements' && (
        <Card className="p-6 bg-tideglass-surface border border-[#D4DED3]">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#D4DED3]">
            <div>
              <h2 className="text-lg font-bold text-[#344942] font-headline">Honors &amp; Achievements</h2>
              <p className="text-xs text-[#516861]">Hackathon wins, academic scholarships, and competitive programming ranks</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit('achievements', resume.achievements || [])}
            >
              <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
              Manage Achievements
            </Button>
          </div>
          {(resume.achievements?.length ?? 0) > 0 ? (
            <ul className="space-y-2.5">
              {resume.achievements?.map((ach, i) => (
                <li
                  key={i}
                  className="flex items-start space-x-3 p-3.5 bg-tideglass-surface rounded-xl border border-[#D4DED3]"
                >
                  <CheckCircle2
                    className="w-5 h-5 text-[#0A7D6E] flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="text-[#344942] text-sm">{ach}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 rounded-xl bg-[#FFFDF7]/80 border border-dashed border-[#D4DED3]">
              <p className="text-[#516861] text-sm mb-3">No achievements listed yet.</p>
              <Button variant="primary" size="sm" onClick={() => onEdit('achievements', [])}>
                Add Achievement
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
export default ResumeSectionViewer;

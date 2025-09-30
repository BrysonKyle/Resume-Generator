import { chromium, Browser } from 'playwright';
import OpenAI from 'openai';
import { OPENAI_CONFIG } from '@/lib/constants';
import { RESUME_PROMPTS, SYSTEM_PROMPT } from '@/lib/prompts';

interface ResumeData {
  userName: string;
  email: string;
  phoneNumber: string;
  linkedinUrl?: string;
  workExperience: Array<{
    companyName: string;
    role: string;
    startDate: string;
    endDate: string;
  }>;
  education: Array<{
    university: string;
    diploma: string;
    startDate: string;
    endDate: string;
  }>;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
}

interface UnifiedResumeResponse {
  professionalSummary: string;
  workExperience: Array<{
    role: string;
    companyName: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements: string[];
  }>;
  skills: string[];
}

export class ResumeGenerator {
  private browser: Browser | null = null;
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: OPENAI_CONFIG.apiKey,
    });
  }

  async generateResume(data: ResumeData): Promise<{ pdfBase64: string; htmlContent: string }> {
    try {
      this.browser = await chromium.launch({ headless: true });
      const page = await this.browser.newPage();

      await page.setViewportSize({ width: 1200, height: 800 });

      const htmlContent = await this.generateHTML(data);

      await page.setContent(htmlContent, { waitUntil: 'networkidle' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        width: '210mm',
        height: '297mm',
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm',
        },
        printBackground: true,
        preferCSSPageSize: true,
      });

      const pdfBase64 = pdfBuffer.toString('base64');

      return {
        pdfBase64,
        htmlContent
      };
    } catch (error) {
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  private async generateHTML(data: ResumeData): Promise<string> {
    const unifiedResponse = await this.generateUnifiedResumeContent(data);
    
    const generatedWorkExp = unifiedResponse.workExperience;
    const professionalSummary = unifiedResponse.professionalSummary;
    const skills = unifiedResponse.skills;
    
    const skillsText = skills.join(', ');
    
    const workExpHTML = generatedWorkExp.map(exp => `
      <div class="work-item">
        <div class="work-header">
          <h3>${exp.role}</h3>
          <span class="company">${exp.companyName}</span>
          <span class="dates">${exp.startDate} - ${exp.endDate}</span>
        </div>
        <div class="work-description">
          <p>${exp.description}</p>
          <ul>
            ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('');

    const educationHTML = data.education.map(edu => `
      <div class="education-item">
        <div class="education-header">
          <h3>${edu.diploma}</h3>
          <div>
            <span class="university">${edu.university}</span>
            <span class="dates">${edu.startDate} - ${edu.endDate}</span>
          </div>
        </div>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resume - ${data.userName}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          @page {
            size: A4;
            margin: 12mm;
          }
          
          body {
            font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.5;
            color: #1a1a1a;
            background: white;
            font-size: 14px;
          }
          
          .resume {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 8mm;
            background: white;
            box-sizing: border-box;
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 20px;
          }
          
          .sidebar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px 20px;
            border-radius: 8px;
            height: fit-content;
          }
          
          .main-content {
            padding-left: 15px;
          }
          
          .header {
            text-align: center;
            padding-bottom: 20px;
          }
          
          .header h1 {
            font-size: 2.2em;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          
          .header .contact {
            font-size: 0.95em;
            color: #4a5568;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 15px;
          }
          
          .header .contact span {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 8px;
            background: #f7fafc;
            border-radius: 4px;
            font-weight: 500;
          }
          
          .contact-icon {
            width: 14px;
            height: 14px;
            display: inline-block;
            opacity: 0.8;
          }
          
          .section {
            margin-bottom: 25px;
          }
          
          .section h2 {
            font-size: 1.3em;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 6px;
            position: relative;
            border-bottom: 2px solid #333333;
            padding-bottom: 6px;
            text-align: center;
          }
          
          .work-item, .education-item {
            padding: 12px;
            transition: all 0.2s ease;
          }
          
          .work-item:hover, .education-item:hover {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            transform: translateY(-1px);
          }
          
          .work-header, .education-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
            flex-wrap: wrap;
            gap: 10px;
          }
          
          .work-description {
            margin-top: 12px;
          }
          
          .work-description p {
            margin-bottom: 12px;
            font-style: italic;
            color: #4a5568;
            font-size: 0.95em;
            line-height: 1.5;
          }
          
          .work-description ul {
            margin-left: 0;
            margin-bottom: 0;
            list-style: none;
            padding-left: 0;
          }
          
          .work-description li {
            margin-bottom: 8px;
            color: #2d3748;
            position: relative;
            padding-left: 20px;
            line-height: 1.5;
          }
          
          .work-description li::before {
            content: '▶';
            position: absolute;
            left: 0;
            top: 0;
            color: #667eea;
            font-size: 0.8em;
            font-weight: bold;
          }
          
          .work-header h3, .education-header h3 {
            font-size: 1.1em;
            font-weight: 600;
            color: #2d3748;
            margin: 0;
            line-height: 1.3;
          }
          
          .company, .university {
            font-weight: 600;
            color: #4a5568;
            font-size: 0.95em;
          }
          
          .dates {
            color: #718096;
            font-size: 0.9em;
            font-weight: 500;
            background: #f7fafc;
            padding: 4px 8px;
            border-radius: 4px;
            white-space: nowrap;
          }
          
          .objective {
            font-size: 1em;
            line-height: 1.6;
            color: #4a5568;
            text-align: left;
            background: #f8fafc;
            padding: 15px;
          }
          
          .skills-text {
            font-size: 0.95em;
            line-height: 1.6;
            color: #4a5568;
            padding: 10px;
          }
          
          .sidebar-section {
            margin-bottom: 25px;
          }
          
          .sidebar-section h3 {
            font-size: 1.1em;
            font-weight: 600;
            color: white;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 0.9em;
          }
          
          .sidebar-section p, .sidebar-section div {
            font-size: 0.9em;
            line-height: 1.5;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 8px;
          }
          
          .skill-tag {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            margin: 2px 4px 2px 0;
            font-weight: 500;
          }
          
          .contact-sidebar {
            margin-bottom: 20px;
          }
          
          .contact-sidebar h3 {
            font-size: 1.1em;
            font-weight: 600;
            color: white;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 0.9em;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 10px;
            font-size: 0.9em;
            color: rgba(255, 255, 255, 0.9);
          }
          
          .contact-item svg {
            width: 14px;
            height: 14px;
            opacity: 0.8;
          }
          
          @media print {
            .resume {
              padding: 8mm;
              display: block;
            }
            .sidebar {
              display: none;
            }
            .main-content {
              padding-left: 0;
            }
            .work-item:hover, .education-item:hover {
              transform: none;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
          }
        </style>
      </head>
      <body>
        <div class="resume">
          <div class="sidebar">
            <div class="contact-sidebar">
              <h3>Contact</h3>
              <div class="contact-item">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <span>${data.email}</span>
              </div>
              <div class="contact-item">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                <span>${data.phoneNumber}</span>
              </div>
              ${data.linkedinUrl ? `
                <div class="contact-item">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span>LinkedIn Profile</span>
                </div>
              ` : ''}
            </div>
            
            <div class="sidebar-section">
              <h3>Skills</h3>
              <div class="skills-sidebar">
                ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
              </div>
            </div>
          </div>
          
          <div class="main-content">
            <div class="header">
              <h1>${data.userName}</h1>
              <div class="contact">
                <span>
                  <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  ${data.email}
                </span>
                <span>
                  <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  ${data.phoneNumber}
                </span>
                ${data.linkedinUrl ? `
                  <span>
                    <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <a href="${data.linkedinUrl}" style="color: #0077b5;">${data.linkedinUrl}</a>
                  </span>
                ` : ''}
              </div>
            </div>
            
            <div class="section">
              <h2>Summary</h2>
              <div class="objective">
                ${professionalSummary}
              </div>
            </div>
            
            ${data.workExperience.length > 0 ? `
            <div class="section">
              <h2>Work Experience</h2>
              ${workExpHTML}
            </div>
            ` : ''}
            
            ${data.education.length > 0 ? `
            <div class="section">
              <h2>Education</h2>
              ${educationHTML}
            </div>
            ` : ''}
            
            <div class="section">
              <h2>Skills</h2>
              <div class="skills-text">
                ${skillsText}
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private async generateUnifiedResumeContent(data: ResumeData): Promise<UnifiedResumeResponse> {
    try {
      const workExpText = data.workExperience.length > 0 
        ? data.workExperience.map(exp => `${exp.role} at ${exp.companyName} (${exp.startDate} - ${exp.endDate})`).join('\n')
        : 'No specific work experience provided - generate relevant experience based on job requirements';
      
      const educationText = data.education.length > 0
        ? data.education.map(edu => `${edu.diploma} from ${edu.university} (${edu.startDate} - ${edu.endDate})`).join('\n')
        : 'No specific education provided';

      const prompt = RESUME_PROMPTS.GENERATE_RESUME
        .replace('{companyName}', data.companyName)
        .replace('{jobTitle}', data.jobTitle)
        .replace('{jobDescription}', data.jobDescription)
        .replace('{userName}', data.userName)
        .replace('{email}', data.email)
        .replace('{phoneNumber}', data.phoneNumber)
        .replace('{linkedinUrl}', data.linkedinUrl || 'Not provided')
        .replace('{workExperience}', workExpText)
        .replace('{education}', educationText);

      const completion = await this.openai.chat.completions.create({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: OPENAI_CONFIG.max_completion_tokens
      });

      const response = completion.choices[0]?.message?.content || '';
      
      try {
        let jsonString = response.trim();
        
        if (jsonString.startsWith('```json')) {
          jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonString.startsWith('```')) {
          jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        const parsed = JSON.parse(jsonString);
        
        // Check if the response contains the final resume in a nested structure
        let finalResume = parsed;
        if (parsed.final_resume) {
          finalResume = parsed.final_resume;
        } else if (parsed.phase8_final_resume) {
          finalResume = parsed.phase8_final_resume;
        }
        
        if (!finalResume.professionalSummary || !finalResume.workExperience || !finalResume.skills) {
          throw new Error('Invalid response structure - missing required fields');
        }

        if (!Array.isArray(finalResume.workExperience)) {
          throw new Error('Work experience must be an array');
        }

        finalResume.workExperience.forEach((exp: any, index: number) => {
          if (!exp.role || !exp.companyName || !exp.description || !Array.isArray(exp.achievements)) {
            throw new Error(`Invalid work experience structure at index ${index}`);
          }
        });

        return finalResume as UnifiedResumeResponse;
      } catch (parseError) {
        console.error('Failed to parse unified response:', parseError);
        console.error('Raw response from OpenAI:', response);
        throw new Error('Invalid JSON response from OpenAI');
      }
    } catch (error) {
      console.error('Unified resume generation failed:', error);
      throw error;
    }
  }
}

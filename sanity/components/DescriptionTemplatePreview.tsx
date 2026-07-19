import React from 'react';
import { StringInputProps, useFormValue } from 'sanity';
import {
  generateProjectDescription,
  type DescriptionTemplate,
} from '@/lib/utils/project-description';

const TEMPLATE_VALUES: DescriptionTemplate[] = [
  'description1',
  'description2',
  'description3',
  'description4',
  'description5',
  'description6',
  'description7',
  'healthcare1',
  'healthcare2',
  'healthcare3',
];

function isTemplate(value: unknown): value is DescriptionTemplate {
  return (
    typeof value === 'string' && (TEMPLATE_VALUES as string[]).includes(value)
  );
}

/**
 * Input for the `description` template selector. Renders the default dropdown
 * and, below it, a LIVE preview of the selected template filled with the
 * current document's values — using the exact same generator the website uses,
 * so what the editor sees matches what gets published.
 */
export function DescriptionTemplatePreview(props: StringInputProps) {
  const template = props.value;

  const location = useFormValue(['location']) as string | undefined;
  const lga = useFormValue(['lga']) as string | undefined;
  const state = useFormValue(['state']) as string | undefined;
  const impactMetrics = useFormValue(['impactMetrics']) as
    | {
        kwp?: number;
        systemType?: string;
        beneficiaries?: number;
        jobsCreatedDirectly?: number;
        jobsCreatedIndirectly?: number;
        annualEnergyOutput?: number;
        annualCO2Reduction?: number;
        bess?: number;
        dieselReduc?: number;
        costSavings?: number;
        patientCareInc?: number;
        uptime?: number;
      }
    | undefined;

  const paragraphs = isTemplate(template)
    ? generateProjectDescription(template, {
        kwp: impactMetrics?.kwp,
        systemType: impactMetrics?.systemType,
        location,
        lga,
        state,
        beneficiaries: impactMetrics?.beneficiaries,
        jobsDirect: impactMetrics?.jobsCreatedDirectly,
        jobsIndirect: impactMetrics?.jobsCreatedIndirectly,
        annualEnergyOutput: impactMetrics?.annualEnergyOutput,
        annualCO2Reduction: impactMetrics?.annualCO2Reduction,
        bess: impactMetrics?.bess,
        dieselReduc: impactMetrics?.dieselReduc,
        costSavings: impactMetrics?.costSavings,
        patientCareInc: impactMetrics?.patientCareInc,
        uptime: impactMetrics?.uptime,
      })
    : [];

  return (
    <div>
      {props.renderDefault(props)}
      {template === 'custom' ? (
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
          Using the custom description below.
        </div>
      ) : (
        paragraphs.length > 0 && (
          <div
            style={{
              marginTop: '12px',
              padding: '12px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              backgroundColor: '#f8fafc',
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#1a202c',
            }}
          >
            <div
              style={{
                marginBottom: '8px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#64748b',
              }}
            >
              Live preview (values pulled from this project)
            </div>
            {paragraphs.map((paragraph, paragraphIndex) => (
              <p
                key={paragraphIndex}
                style={{ margin: paragraphIndex === 0 ? 0 : '12px 0 0' }}
              >
                {paragraph.map((segment, segmentIndex) =>
                  segment.bold ? (
                    <strong key={segmentIndex}>{segment.text}</strong>
                  ) : (
                    <React.Fragment key={segmentIndex}>
                      {segment.text}
                    </React.Fragment>
                  ),
                )}
              </p>
            ))}
          </div>
        )
      )}
    </div>
  );
}

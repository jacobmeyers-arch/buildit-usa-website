/**
 * PDF Generator using @react-pdf/renderer
 * 
 * Generates Property Summary Report PDF from cross-project analysis
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subsectionHeader: {
    fontSize: 13,
    marginBottom: 5,
    fontWeight: 'bold',
    marginTop: 10,
  },
  text: {
    marginBottom: 5,
    lineHeight: 1.5,
  },
  bulletPoint: {
    marginLeft: 15,
    marginBottom: 3,
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 5,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#666',
  },
});

/**
 * Property Summary Report PDF Document
 */
const PropertyReportDocument = ({ reportData }) => {
  const {
    userEmail,
    zipCode,
    projectCount,
    projects,
    crossProjectAnalysis,
    generatedDate
  } = reportData;

  const isSingleProject = projectCount <= 1;
  const { sequenced_projects, bundle_groups, quick_wins, total_cost_range, optimization_summary } = crossProjectAnalysis || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.section}>
          <Text style={styles.header}>BuildIt USA Property Summary Report</Text>
          <Text style={styles.text}>Generated: {generatedDate}</Text>
          <Text style={styles.text}>Property Location: {zipCode}</Text>
          <Text style={styles.text}>Contact: {userEmail}</Text>
        </View>

        {/* 1. Property Improvement Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>1. Property Improvement Overview</Text>
          <Text style={styles.text}>Total Projects: {projectCount}</Text>
          <Text style={styles.text}>
            Total Investment Range: ${total_cost_range.low.toLocaleString()} - ${total_cost_range.high.toLocaleString()}
          </Text>
          <Text style={styles.text}>{optimization_summary}</Text>
        </View>

        {/* 2. Project Priority Roadmap */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>2. Project Priority Roadmap</Text>
          {isSingleProject && (
            <Text style={styles.text}>
              Add more projects to unlock priority sequencing and savings recommendations.
            </Text>
          )}
          {!isSingleProject && sequenced_projects && sequenced_projects.map((sp, idx) => {
            const project = projects.find(p => p.id === sp.project_id);
            if (!project) return null;

            return (
              <View key={sp.project_id} style={{ marginBottom: 15 }}>
                <Text style={styles.subsectionHeader}>
                  #{sp.recommended_sequence}: {project.title}
                </Text>
                <Text style={styles.bulletPoint}>
                  • Cost Range: ${project.cost_estimate?.total_low?.toLocaleString() || 'N/A'} - 
                  ${project.cost_estimate?.total_high?.toLocaleString() || 'N/A'}
                </Text>
                <Text style={styles.bulletPoint}>
                  • Priority Score: {sp.priority_score}/100
                </Text>
                <Text style={styles.bulletPoint}>
                  • Reasoning: {sp.reasoning}
                </Text>
                <Text style={styles.bulletPoint}>
                  • Understanding: {project.understanding_score}%
                </Text>
              </View>
            );
          })}
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {/* 3. Smart Savings Opportunities */}
        {isSingleProject && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>3. Smart Savings Opportunities</Text>
            <Text style={styles.text}>
              Add more projects to unlock bundle savings and cross-project optimization.
            </Text>
          </View>
        )}
        {!isSingleProject && bundle_groups && bundle_groups.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>3. Smart Savings Opportunities</Text>
            {bundle_groups.map((bundle, idx) => (
              <View key={idx} style={{ marginBottom: 10 }}>
                <Text style={styles.subsectionHeader}>{bundle.bundle_name}</Text>
                <Text style={styles.bulletPoint}>
                  • Projects: {bundle.project_ids.map(pid => {
                    const p = projects.find(pr => pr.id === pid);
                    return p?.title || pid;
                  }).join(', ')}
                </Text>
                <Text style={styles.bulletPoint}>
                  • Estimated Savings: {bundle.estimated_savings_percent}%
                </Text>
                <Text style={styles.bulletPoint}>
                  • Reasoning: {bundle.reasoning}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* 4. Quick Wins */}
        {quick_wins && quick_wins.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>4. Quick Wins (Under $2,000)</Text>
            {quick_wins.map(qwId => {
              const project = projects.find(p => p.id === qwId);
              if (!project) return null;
              return (
                <Text key={qwId} style={styles.bulletPoint}>
                  • {project.title}: ${project.cost_estimate?.total_low?.toLocaleString()} - 
                  ${project.cost_estimate?.total_high?.toLocaleString()}
                </Text>
              );
            })}
          </View>
        )}

        {/* 5. Investment Summary Table */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>5. Investment Summary</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Project</Text>
              <Text style={styles.tableCell}>Low</Text>
              <Text style={styles.tableCell}>High</Text>
              <Text style={styles.tableCell}>Priority</Text>
            </View>
            {sequenced_projects.map(sp => {
              const project = projects.find(p => p.id === sp.project_id);
              if (!project) return null;
              return (
                <View key={sp.project_id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2, fontSize: 9 }]}>{project.title}</Text>
                  <Text style={[styles.tableCell, { fontSize: 9 }]}>
                    ${project.cost_estimate?.total_low?.toLocaleString() || 'N/A'}
                  </Text>
                  <Text style={[styles.tableCell, { fontSize: 9 }]}>
                    ${project.cost_estimate?.total_high?.toLocaleString() || 'N/A'}
                  </Text>
                  <Text style={[styles.tableCell, { fontSize: 9 }]}>{sp.priority_score}</Text>
                </View>
              );
            })}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Total</Text>
              <Text style={styles.tableCell}>${total_cost_range.low.toLocaleString()}</Text>
              <Text style={styles.tableCell}>${total_cost_range.high.toLocaleString()}</Text>
              <Text style={styles.tableCell}>-</Text>
            </View>
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {/* 6. What a Contractor Needs From You */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>6. What a Contractor Needs From You</Text>
          {projects.map(project => (
            <View key={project.id} style={{ marginBottom: 10 }}>
              <Text style={styles.subsectionHeader}>{project.title}</Text>
              <Text style={styles.bulletPoint}>
                • Access to project area for detailed assessment
              </Text>
              <Text style={styles.bulletPoint}>
                • Any existing plans, permits, or documentation
              </Text>
              {project.understanding_score < 80 && (
                <Text style={styles.bulletPoint}>
                  • Additional details on scope (understanding: {project.understanding_score}%)
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* 7. Next Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>7. Recommended Next Steps</Text>
          <Text style={styles.bulletPoint}>
            1. Start with priority projects (highest priority scores)
          </Text>
          <Text style={styles.bulletPoint}>
            2. Get 3-5 contractor bids for each project
          </Text>
          <Text style={styles.bulletPoint}>
            3. Consider bundling projects in the same group for cost savings
          </Text>
          <Text style={styles.bulletPoint}>
            4. Schedule any recommended inspections before starting work
          </Text>
          <Text style={styles.bulletPoint}>
            5. Review permit requirements with your local building department
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by BuildIt USA • builditusa.com • support@builditusa.com
        </Text>
      </Page>
    </Document>
  );
};

/**
 * Generate Property Summary Report PDF
 * @param {Object} reportData - Report data including projects and analysis
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generatePropertyReport(reportData) {
  try {
    const blob = await pdf(<PropertyReportDocument reportData={reportData} />).toBlob();
    const buffer = await blob.arrayBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

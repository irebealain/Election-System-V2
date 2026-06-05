import React, { useRef, forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import PieChartWrapper from './common/PieChartWrapper';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const PDFGenerator = forwardRef(({ election, positions, getPositionResults }, ref) => {
  const chartRefs = useRef({});
  const [isReady, setIsReady] = useState(false);
  const [charts, setCharts] = useState({});

  // Add custom fonts
  useEffect(() => {
    if (election && positions) {
      // Create charts for each position
      const newCharts = {};
      positions
        .filter(p => p.electionId === election._id)
        .forEach(position => {
          const results = getPositionResults(position._id);
          newCharts[position._id] = (
            <div
              key={position._id}
              ref={el => chartRefs.current[position._id] = el}
              style={{ 
                width: '400px', 
                height: '300px',
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <PieChartWrapper
                data={results.map(result => ({
                  ...result,
                  total: results.reduce((a, b) => a + b.value, 0),
                  percentage: ((result.value / results.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)
                }))}
                colors={COLORS}
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                height="100%"
                showLegend={true}
                showTooltip={true}
              />
            </div>
          );
        });
      setCharts(newCharts);
      
      setTimeout(() => {
        setIsReady(true);
      }, 1000);
    }
  }, [election, positions]);

  const generatePDF = async () => {
    try {
      if (!election || !positions) {
        console.error('Missing data:', { election, positions });
        return false;
      }

      if (!isReady) {
        console.error('PDF Generator is not ready yet');
        return false;
      }

      // Create a new PDF document with custom settings
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        putOnlyUsedFonts: true
      });

      // Set document properties
      pdf.setProperties({
        title: `${election.title} - Election Results`,
        subject: 'Election Results Report',
        author: 'Election System',
        keywords: 'election, results, report',
        creator: 'Election System'
      });

      // Add header with logo or title
      pdf.setFillColor(41, 128, 185); // Nice blue color
      pdf.rect(0, 0, 210, 30, 'F');
      
      // Add title with custom styling
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(election.title, 105, 20, { align: 'center' });
      
      // Add subtitle
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Election Results Report', 105, 28, { align: 'center' });

      // Reset text color for content
      pdf.setTextColor(0, 0, 0);
      
      // Add date with styling
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy')}`, 20, 40);

      let yOffset = 50;

      // Process each position
      const electionPositions = positions.filter(p => p.electionId === election._id);
      
      for (const position of electionPositions) {
        const positionResults = getPositionResults(position._id);
        
        // Add position title with styling
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(41, 128, 185);
        pdf.text(position.title, 20, yOffset);
        yOffset += 10;

        // Add a line under the title
        pdf.setDrawColor(41, 128, 185);
        pdf.line(20, yOffset - 2, 190, yOffset - 2);
        yOffset += 5;

        // Get the chart element
        const chartElement = chartRefs.current[position._id];
        
        if (chartElement) {
          try {
            // Convert chart to canvas with specific options
            const canvas = await html2canvas(chartElement, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              logging: false,
              onclone: (clonedDoc) => {
                const clonedElement = clonedDoc.querySelector(`[data-position-id="${position._id}"]`);
                if (clonedElement) {
                  clonedElement.style.backgroundColor = 'white';
                }
              }
            });

            // Convert canvas to image with better quality
            const imgData = canvas.toDataURL('image/jpeg', 1.0);

            // Add chart to PDF with a border
            pdf.setDrawColor(200, 200, 200);
            pdf.rect(15, yOffset - 5, 180, 130);
            pdf.addImage(imgData, 'JPEG', 20, yOffset, 170, 120);
            yOffset += 130;

            // Add results table with styling
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(41, 128, 185);
            
            // Table header
            pdf.text('Candidate', 20, yOffset);
            pdf.text('Votes', 120, yOffset);
            pdf.text('Percentage', 160, yOffset);
            yOffset += 8;

            // Table rows
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(0, 0, 0);
            positionResults.forEach(result => {
              pdf.text(result.name, 20, yOffset);
              pdf.text(result.value.toString(), 120, yOffset);
              pdf.text(`${result.percentage.toFixed(1)}%`, 160, yOffset);
              yOffset += 8;
            });

            // Add spacing between positions
            yOffset += 15;

            // If we're running out of space, add a new page
            if (yOffset > 250) {
              pdf.addPage();
              yOffset = 20;
            }
          } catch (error) {
            console.error('Error processing chart:', error);
            pdf.setFontSize(12);
            pdf.setTextColor(255, 0, 0);
            pdf.text('Error generating chart', 20, yOffset);
            yOffset += 20;
          }
        }
      }

      // Add footer
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
      }

      // Save the PDF with a clean filename
      const fileName = `election_results_${election.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);
      
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    generatePDF,
    isReady
  }));

  if (!election || !positions) {
    return null;
  }

  return (
    <div style={{ display: 'none' }}>
      {Object.entries(charts).map(([positionId, chart]) => (
        <div key={positionId} data-position-id={positionId}>
          {chart}
        </div>
      ))}
    </div>
  );
});

export default PDFGenerator; 
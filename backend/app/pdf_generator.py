import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

class PDFThreatReportGenerator:
    
    @staticmethod
    def generate_threat_report(report_data: dict) -> bytes:
        """
        Generates a professional military threat report in PDF.
        report_data keys:
        - threat_id: unique ID
        - threat_type: e.g. SQL Injection, Steganography
        - severity: LOW, MEDIUM, HIGH, CRITICAL
        - layer: Layer that caught it
        - details: Description
        - timestamp: datetime
        - sender_country: Country A
        - receiver_country: Country B
        - attack_origin: latitude, longitude, IP
        - blockchain_block: block index, hash
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=54,
            bottomMargin=54
        )
        
        styles = getSampleStyleSheet()
        
        # Custom Military styles
        title_style = ParagraphStyle(
            name='MilitaryTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            textColor=colors.HexColor('#D4AF37'), # Gold
            alignment=1, # Center
            spaceAfter=15
        )
        
        header_banner_style = ParagraphStyle(
            name='Banner',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=12,
            textColor=colors.white,
            alignment=1, # Center
            spaceAfter=20
        )
        
        section_heading = ParagraphStyle(
            name='SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            textColor=colors.HexColor('#2E5A27'), # Dark Green
            spaceBefore=12,
            spaceAfter=6
        )
        
        body_style = ParagraphStyle(
            name='ReportBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            textColor=colors.HexColor('#333333'),
            leading=14
        )
        
        bold_body_style = ParagraphStyle(
            name='BoldReportBody',
            parent=body_style,
            fontName='Helvetica-Bold'
        )

        elements = []
        
        # TOP BANNER
        banner_color = colors.HexColor('#8B0000') if report_data.get('severity') in ['HIGH', 'CRITICAL'] else colors.HexColor('#2E5A27')
        banner_text = "CLASSIFICATION: SECRET // DEFENSE-GRADE THREAT SHIELD REPORT"
        banner_table = Table([[Paragraph(banner_text, header_banner_style)]], colWidths=[540])
        banner_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), banner_color),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8),
        ]))
        
        elements.append(banner_table)
        elements.append(Spacer(1, 15))
        
        # TITLE
        elements.append(Paragraph("THREAT BLOCK & DIAGNOSTIC AUDIT", title_style))
        elements.append(Spacer(1, 10))
        
        # BASIC INFORMATION TABLE
        data = [
            [Paragraph("Report Serial Number:", bold_body_style), Paragraph(str(report_data.get('threat_id', 'N/A')), body_style),
             Paragraph("Timestamp:", bold_body_style), Paragraph(str(report_data.get('timestamp', 'N/A')), body_style)],
            [Paragraph("Threat Source Node:", bold_body_style), Paragraph(str(report_data.get('sender_country', 'Country A')), body_style),
             Paragraph("Threat Target Node:", bold_body_style), Paragraph(str(report_data.get('receiver_country', 'Country B')), body_style)],
            [Paragraph("Intercepting Layer:", bold_body_style), Paragraph(str(report_data.get('layer', 'Security Pipeline')), body_style),
             Paragraph("Action Code:", bold_body_style), Paragraph("BLOCKED & QUARANTINED", bold_body_style)],
        ]
        
        info_table = Table(data, colWidths=[120, 150, 100, 170])
        info_table.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CCCCCC')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E5E5')),
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F5F5F5')),
            ('BACKGROUND', (2,0), (2,-1), colors.HexColor('#F5F5F5')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        
        elements.append(info_table)
        elements.append(Spacer(1, 20))
        
        # THREAT ASSESSMENT SECTION
        elements.append(Paragraph("THREAT ASSESSMENT & SEVERITY", section_heading))
        
        severity_color = "#FF0000" if report_data.get('severity') == "CRITICAL" else \
                         "#FF6600" if report_data.get('severity') == "HIGH" else \
                         "#FFCC00" if report_data.get('severity') == "MEDIUM" else "#009900"
                         
        severity_para = Paragraph(f"<font color='{severity_color}'><b>{report_data.get('severity', 'UNKNOWN')}</b></font>", bold_body_style)
        
        threat_details = [
            [Paragraph("Threat Classification:", bold_body_style), Paragraph(str(report_data.get('threat_type', 'Undefined Threat')), body_style)],
            [Paragraph("Severity Code Level:", bold_body_style), severity_para],
            [Paragraph("Diagnostic Details:", bold_body_style), Paragraph(str(report_data.get('details', 'No details specified.')), body_style)],
        ]
        
        threat_table = Table(threat_details, colWidths=[120, 420])
        threat_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('LINEBELOW', (0,0), (-1,-2), 0.5, colors.HexColor('#E5E5E5')),
        ]))
        elements.append(threat_table)
        elements.append(Spacer(1, 20))
        
        # ATTACK GEOLOCATION & NETWORK METADATA
        elements.append(Paragraph("ATTACK METADATA & TELEMETRY", section_heading))
        
        origin_ip = report_data.get('origin_ip', '127.0.0.1')
        origin_coords = report_data.get('origin_coords', '0.00N, 0.00E')
        
        telemetry_data = [
            [Paragraph("Originating IP:", bold_body_style), Paragraph(origin_ip, body_style)],
            [Paragraph("Calculated Coordinates:", bold_body_style), Paragraph(origin_coords, body_style)],
            [Paragraph("System Alert Triggered:", bold_body_style), Paragraph("YES (WAF / Pipeline Intercept Route)", body_style)]
        ]
        
        telemetry_table = Table(telemetry_data, colWidths=[150, 390])
        telemetry_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('LINEBELOW', (0,0), (-1,-2), 0.5, colors.HexColor('#E5E5E5')),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(telemetry_table)
        elements.append(Spacer(1, 20))
        
        # IMMUTABLE AUDIT RECEIPT
        elements.append(Paragraph("BLOCKCHAIN AUDIT RECEIPT", section_heading))
        
        block_idx = report_data.get('block_index', 'N/A')
        block_hash = report_data.get('block_hash', 'N/A')
        prev_hash = report_data.get('previous_hash', 'N/A')
        
        blockchain_data = [
            [Paragraph("Ledger Block Index:", bold_body_style), Paragraph(str(block_idx), body_style)],
            [Paragraph("Current Block Hash:", bold_body_style), Paragraph(str(block_hash), body_style)],
            [Paragraph("Previous Block Link:", bold_body_style), Paragraph(str(prev_hash), body_style)],
            [Paragraph("Status:", bold_body_style), Paragraph("<b>IMMUTABLE RECORD SEALED</b>", body_style)],
        ]
        
        blockchain_table = Table(blockchain_data, colWidths=[150, 390])
        blockchain_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('LINEBELOW', (0,0), (-1,-2), 0.5, colors.HexColor('#E5E5E5')),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BACKGROUND', (0,3), (-1,3), colors.HexColor('#EBF3EB')), # light green bg for success seal
        ]))
        elements.append(blockchain_table)
        
        elements.append(Spacer(1, 30))
        
        # SIGNATURE AREA
        sig_data = [
            [Paragraph("<b>OFFICER SIGNATURE</b><br/>System Shield Automated Agent", body_style),
             Paragraph("<b>VERIFICATION SEAL</b><br/>PQC Hybrid Pipeline Audited", body_style)]
        ]
        sig_table = Table(sig_data, colWidths=[270, 270])
        sig_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('LINEABOVE', (0,0), (-1,-1), 1, colors.HexColor('#AAAAAA')),
            ('TOPPADDING', (0,0), (-1,-1), 10),
        ]))
        elements.append(sig_table)
        
        # Footer classification repeat
        elements.append(Spacer(1, 40))
        elements.append(banner_table)

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

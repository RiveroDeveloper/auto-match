import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from core.interfaces.report_generator import IVehicleReportGenerator

class PdfReportGenerator(IVehicleReportGenerator):
    """
    Implementación concreta de IVehicleReportGenerator usando ReportLab.
    Esta clase es el 'detalle' de bajo nivel que depende de la abstracción.
    """
    
    def generate_report(self, vehicle) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # Título
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=1  # Center
        )
        story.append(Paragraph(f"Reporte de Vehículo: {vehicle.make.name} {vehicle.model}", title_style))
        story.append(Spacer(1, 12))

        # Imagen del vehículo (si existe)
        if vehicle.image:
            try:
                # Ajustar ruta de imagen según tu configuración de media
                img_path = vehicle.image.path
                img = Image(img_path, width=400, height=300)
                img.hAlign = 'CENTER'
                story.append(img)
                story.append(Spacer(1, 20))
            except Exception as e:
                story.append(Paragraph(f"(Imagen no disponible: {str(e)})", styles["Normal"]))

        # Datos del vehículo
        data = [
            ["Atributo", "Detalle"],
            ["Marca", vehicle.make.name],
            ["Modelo", vehicle.model],
            ["Año", str(vehicle.year)],
            ["Precio", f"${vehicle.price:,.2f}"],
            ["Color", vehicle.color],
            ["Categoría", vehicle.category.name if vehicle.category else "N/A"],
            ["Disponible", "Sí" if vehicle.is_available else "No"]
        ]

        # Estilo de la tabla
        table = Table(data, colWidths=[150, 300])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))

        story.append(table)
        story.append(Spacer(1, 20))

        # Footer
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=1
        )
        story.append(Paragraph("Generado automáticamente por Car Store System", footer_style))

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

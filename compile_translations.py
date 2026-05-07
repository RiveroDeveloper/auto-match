#!/usr/bin/env python
"""
Script para compilar archivos .po a .mo sin necesitar gettext instalado.
Usa la librería polib que viene con Django.
"""
import os
import sys

def compile_po_file(po_path):
    """Compila un archivo .po a .mo"""
    try:
        # Intentar usar polib si está disponible
        import polib
        po = polib.pofile(po_path)
        mo_path = po_path.replace('.po', '.mo')
        po.save_as_mofile(mo_path)
        print(f"✓ Compilado: {mo_path}")
        return True
    except ImportError:
        print("Error: polib no está instalado. Instalando...")
        os.system(f"{sys.executable} -m pip install polib")
        # Reintentar
        import polib
        po = polib.pofile(po_path)
        mo_path = po_path.replace('.po', '.mo')
        po.save_as_mofile(mo_path)
        print(f"✓ Compilado: {mo_path}")
        return True
    except Exception as e:
        print(f"✗ Error compilando {po_path}: {e}")
        return False

def main():
    """Busca y compila todos los archivos .po en el proyecto"""
    locale_dir = os.path.join('backend', 'locale')
    
    if not os.path.exists(locale_dir):
        print(f"Error: No se encontró el directorio {locale_dir}")
        return
    
    print("Compilando archivos de traducción...")
    print("-" * 50)
    
    compiled = 0
    for root, dirs, files in os.walk(locale_dir):
        for file in files:
            if file.endswith('.po'):
                po_path = os.path.join(root, file)
                if compile_po_file(po_path):
                    compiled += 1
    
    print("-" * 50)
    print(f"Total compilados: {compiled} archivo(s)")

if __name__ == '__main__':
    main()

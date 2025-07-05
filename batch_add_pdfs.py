#!/usr/bin/env python3
"""
Batch PDF Import Script
Example script to add hundreds/thousands of PDFs from CSV or list

Usage:
1. Prepare a CSV file with PDF information
2. Run this script to import all PDFs at once
"""

import csv
from pdf_manager import PDFManager

def import_from_csv(csv_file):
    """Import PDFs from CSV file"""
    manager = PDFManager()
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            count = 0
            
            for row in reader:
                # Extract data from CSV row
                title = row.get('title', '').strip()
                category = row.get('category', '').strip()
                author = row.get('author', 'Unknown Author').strip()
                description = row.get('description', '').strip()
                tags = [tag.strip() for tag in row.get('tags', '').split(',') if tag.strip()]
                file_size = row.get('fileSize', 'Unknown').strip()
                pages = int(row.get('pages', 0)) if row.get('pages', '').isdigit() else 0
                year = int(row.get('year', 2024)) if row.get('year', '').isdigit() else 2024
                language = row.get('language', 'Tamil').strip()
                
                if title and category:
                    success = manager.add_pdf(
                        title=title,
                        category=category,
                        author=author,
                        description=description,
                        tags=tags,
                        fileSize=file_size,
                        pages=pages,
                        year=year,
                        language=language
                    )
                    if success:
                        count += 1
                else:
                    print(f"⚠️ Skipping row: missing title or category")
            
            manager.save_data()
            print(f"\n🎉 Successfully imported {count} PDFs!")
            
    except FileNotFoundError:
        print(f"❌ CSV file not found: {csv_file}")
    except Exception as e:
        print(f"❌ Error reading CSV: {e}")

def create_sample_csv():
    """Create a sample CSV file for reference"""
    sample_data = [
        {
            'title': 'Bharathiyar Kavithaigal Volume 1',
            'category': 'Poems',
            'author': 'Mahakavi Bharathiyar',
            'description': 'Collection of patriotic poems',
            'tags': 'bharathiyar,patriotic,independence',
            'fileSize': '2.5 MB',
            'pages': 125,
            'year': 1908,
            'language': 'Tamil'
        },
        {
            'title': 'Silapathikaram',
            'category': 'Literature',
            'author': 'Ilango Adigal',
            'description': 'One of the five great epics of Tamil literature',
            'tags': 'epic,classic,ancient',
            'fileSize': '8.2 MB',
            'pages': 456,
            'year': 200,
            'language': 'Tamil'
        },
        {
            'title': 'Tamil Grammar Basics',
            'category': 'Tamil Grammar',
            'author': 'Dr. Tamil Scholar',
            'description': 'Comprehensive guide to Tamil grammar',
            'tags': 'grammar,education,language',
            'fileSize': '3.1 MB',
            'pages': 200,
            'year': 2020,
            'language': 'Tamil'
        }
    ]
    
    with open('sample_pdfs.csv', 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['title', 'category', 'author', 'description', 'tags', 'fileSize', 'pages', 'year', 'language']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for row in sample_data:
            writer.writerow(row)
    
    print("✅ Created sample_pdfs.csv - edit this file and run the import!")

def add_many_pdfs_example():
    """Example of adding many PDFs programmatically"""
    manager = PDFManager()
    
    # Example: Add 20 sample PDFs
    tamil_books = [
        ("Thirukkural - Arathupaal", "Thirukkural", "Thiruvalluvar"),
        ("Thirukkural - Porutpaal", "Thirukkural", "Thiruvalluvar"),
        ("Thirukkural - Kaamathupaal", "Thirukkural", "Thiruvalluvar"),
        ("Kambaramayanam - Bala Kandam", "Literature", "Kamban"),
        ("Kambaramayanam - Ayodhya Kandam", "Literature", "Kamban"),
        ("Periya Puranam", "Literature", "Sekkilar"),
        ("Manimekalai", "Literature", "Seethalai Saathanar"),
        ("Civaka Cinthamani", "Literature", "Tiruttakkateva"),
        ("Bharathiyar Poems - Volume 1", "Poems", "Mahakavi Bharathiyar"),
        ("Bharathiyar Poems - Volume 2", "Poems", "Mahakavi Bharathiyar"),
        ("Bharathidasan Poems", "Poems", "Kaviarasu Bharathidasan"),
        ("Subramania Bharathi Essays", "Literature", "Mahakavi Bharathiyar"),
        ("Tamil Grammar - Nannool", "Tamil Grammar", "Pavanandhi"),
        ("Tamil Grammar - Tolkappiyam", "Tamil Grammar", "Tolkappiyar"),
        ("Tamil History - Ancient Period", "History", "Tamil Historians"),
        ("Tamil History - Medieval Period", "History", "Tamil Historians"),
        ("Tamil Literature - English Translation", "English Translations", "Various Translators"),
        ("Sangam Literature - Kuruntokai", "Literature", "Various Poets"),
        ("Sangam Literature - Narrinai", "Literature", "Various Poets"),
        ("Philosophical Works - Thiruvasagam", "Literature", "Maanikkavachakar")
    ]
    
    print("📚 Adding sample Tamil books...")
    for title, category, author in tamil_books:
        manager.add_pdf(
            title=title,
            category=category,
            author=author,
            description=f"Classic Tamil work: {title}",
            tags=["tamil", "classic", "literature"],
            language="Tamil"
        )
    
    manager.save_data()
    print(f"✅ Added {len(tamil_books)} sample PDFs!")

if __name__ == "__main__":
    print("📚 BATCH PDF IMPORT TOOL")
    print("=" * 40)
    print("1. Import from CSV file")
    print("2. Create sample CSV file")
    print("3. Add sample PDFs")
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice == '1':
        csv_file = input("Enter CSV filename (default: sample_pdfs.csv): ").strip()
        csv_file = csv_file or "sample_pdfs.csv"
        import_from_csv(csv_file)
    
    elif choice == '2':
        create_sample_csv()
    
    elif choice == '3':
        add_many_pdfs_example()
    
    else:
        print("❌ Invalid choice!")

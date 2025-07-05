#!/usr/bin/env python3
"""
Simple PDF Category Manager
Easy way to add PDFs organized by category
"""

from pdf_manager import PDFManager

def add_pdfs_interactive():
    """Interactive mode to add PDFs by category"""
    manager = PDFManager()
    
    print("📚 TAMIL PDF LIBRARY - ADD PDFS BY CATEGORY")
    print("=" * 50)
    
    # Show available categories
    print("\nAvailable categories:")
    for i, category in enumerate(manager.data["categories"].keys(), 1):
        print(f"{i}. {category}")
    
    while True:
        print("\n" + "="*50)
        print("1. Add PDFs to a category")
        print("2. View category statistics")
        print("3. Exit")
        
        choice = input("\nEnter your choice (1-3): ").strip()
        
        if choice == '1':
            add_pdfs_to_category(manager)
        elif choice == '2':
            manager.print_category_stats()
        elif choice == '3':
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice!")

def add_pdfs_to_category(manager):
    """Add multiple PDFs to a specific category"""
    categories = list(manager.data["categories"].keys())
    
    print(f"\nSelect category (1-{len(categories)}):")
    for i, category in enumerate(categories, 1):
        print(f"{i}. {category}")
    
    try:
        cat_choice = int(input(f"\nEnter category number (1-{len(categories)}): ")) - 1
        if cat_choice < 0 or cat_choice >= len(categories):
            print("❌ Invalid category number!")
            return
        
        selected_category = categories[cat_choice]
        print(f"\n📚 Adding PDFs to: {selected_category}")
        
        pdfs_to_add = []
        
        while True:
            print(f"\n--- Adding PDF #{len(pdfs_to_add) + 1} ---")
            
            title = input("Title (or 'done' to finish): ").strip()
            if title.lower() == 'done':
                break
            
            author = input("Author: ").strip() or "Unknown Author"
            description = input("Description: ").strip()
            tags_input = input("Tags (comma-separated): ").strip()
            tags = [tag.strip() for tag in tags_input.split(',') if tag.strip()]
            
            featured = input("Featured? (y/n): ").strip().lower() == 'y'
            
            pdf_info = {
                "title": title,
                "author": author,
                "description": description,
                "tags": tags,
                "featured": featured
            }
            
            pdfs_to_add.append(pdf_info)
            
            continue_adding = input(f"\nAdd another PDF to {selected_category}? (y/n): ").strip().lower()
            if continue_adding != 'y':
                break
        
        if pdfs_to_add:
            category_pdfs = {selected_category: pdfs_to_add}
            manager.add_pdfs_by_category(category_pdfs)
        else:
            print("No PDFs to add.")
            
    except ValueError:
        print("❌ Please enter a valid number!")

def add_sample_pdfs():
    """Add sample PDFs to demonstrate the system"""
    manager = PDFManager()
    
    sample_pdfs = {
        "Poems": [
            {
                "title": "Bharathiyar Kavithaigal - Volume 1",
                "author": "Mahakavi Bharathiyar",
                "description": "Collection of patriotic poems by Bharathiyar",
                "tags": ["bharathiyar", "patriotic", "independence", "tamil"],
                "featured": True
            },
            {
                "title": "Bharathidasan Poems",
                "author": "Kaviarasu Bharathidasan", 
                "description": "Modern Tamil poetry collection",
                "tags": ["bharathidasan", "modern", "poetry", "tamil"],
                "featured": False
            },
            {
                "title": "Subramania Bharathi - Selected Poems",
                "author": "Mahakavi Bharathiyar",
                "description": "Selected poems from the great Tamil poet",
                "tags": ["bharathiyar", "poetry", "classic", "tamil"],
                "featured": True
            }
        ],
        "Literature": [
            {
                "title": "Silapathikaram",
                "author": "Ilango Adigal",
                "description": "One of the five great epics of Tamil literature",
                "tags": ["epic", "classic", "ancient", "literature"],
                "featured": True
            },
            {
                "title": "Kambaramayanam - Bala Kandam",
                "author": "Kamban",
                "description": "First chapter of Kamban's Ramayana",
                "tags": ["kamban", "ramayana", "epic", "classic"],
                "featured": False
            },
            {
                "title": "Periya Puranam",
                "author": "Sekkilar",
                "description": "Biographies of 63 Nayanmars",
                "tags": ["nayanmars", "bhakti", "saivism", "classic"],
                "featured": False
            }
        ],
        "Thirukkural": [
            {
                "title": "Thirukkural - Complete",
                "author": "Thiruvalluvar",
                "description": "Complete collection of 1330 couplets",
                "tags": ["thiruvalluvar", "ethics", "morality", "wisdom"],
                "featured": True
            },
            {
                "title": "Thirukkural - Arathupaal",
                "author": "Thiruvalluvar",
                "description": "First section: Virtue (Aram)",
                "tags": ["thiruvalluvar", "virtue", "ethics", "arathupaal"],
                "featured": False
            },
            {
                "title": "Thirukkural - Porutpaal", 
                "author": "Thiruvalluvar",
                "description": "Second section: Wealth (Porul)",
                "tags": ["thiruvalluvar", "wealth", "politics", "porutpaal"],
                "featured": False
            }
        ],
        "History": [
            {
                "title": "Tamil History - Ancient Period",
                "author": "Tamil Historians",
                "description": "Ancient Tamil history and civilization",
                "tags": ["history", "ancient", "civilization", "tamil"],
                "featured": True
            },
            {
                "title": "Tamil History - Medieval Period",
                "author": "Tamil Historians", 
                "description": "Medieval Tamil history and kingdoms",
                "tags": ["history", "medieval", "kingdoms", "tamil"],
                "featured": False
            }
        ],
        "Tamil Grammar": [
            {
                "title": "Tamil Grammar - Nannool",
                "author": "Pavanandhi",
                "description": "Classic Tamil grammar text",
                "tags": ["grammar", "nannool", "classic", "education"],
                "featured": True
            },
            {
                "title": "Tamil Grammar - Tolkappiyam",
                "author": "Tolkappiyar",
                "description": "Ancient Tamil grammar treatise",
                "tags": ["grammar", "tolkappiyam", "ancient", "classic"],
                "featured": False
            }
        ],
        "English Translations": [
            {
                "title": "Tamil Literature - English Translation",
                "author": "Various Translators",
                "description": "English translations of Tamil literary works",
                "tags": ["translation", "english", "literature", "tamil"],
                "featured": True
            }
        ]
    }
    
    print("📚 Adding sample PDFs to all categories...")
    manager.add_pdfs_by_category(sample_pdfs)
    manager.print_category_stats()

if __name__ == "__main__":
    print("📚 TAMIL PDF LIBRARY - PDF MANAGER")
    print("=" * 40)
    print("1. Interactive mode (add PDFs manually)")
    print("2. Add sample PDFs to all categories")
    print("3. View current statistics")
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice == '1':
        add_pdfs_interactive()
    elif choice == '2':
        add_sample_pdfs()
    elif choice == '3':
        manager = PDFManager()
        manager.print_category_stats()
    else:
        print("❌ Invalid choice!") 
#!/usr/bin/env python3
"""
PDF Manager for Tamil PDF Library
Handles adding, updating, and organizing PDFs by category
"""

import json
import os
import uuid
from datetime import datetime
from pathlib import Path

class PDFManager:
    def __init__(self, json_file='assets/data/pdfs.json'):
        self.json_file = json_file
        self.data = self.load_data()
    
    def load_data(self):
        """Load existing PDF data from JSON file"""
        try:
            with open(self.json_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            # Create default structure if file doesn't exist
            return {
                "categories": {
                    "Poems": {
                        "name": "Poems",
                        "description": "Tamil poetry and verses",
                        "icon": "📝",
                        "count": 0,
                        "pdfs": []
                    },
                    "Literature": {
                        "name": "Literature", 
                        "description": "Tamil literature and novels",
                        "icon": "📚",
                        "count": 0,
                        "pdfs": []
                    },
                    "Thirukkural": {
                        "name": "Thirukkural",
                        "description": "Thiruvalluvar's Thirukkural",
                        "icon": "🏛️",
                        "count": 0,
                        "pdfs": []
                    },
                    "History": {
                        "name": "History",
                        "description": "Tamil history and heritage",
                        "icon": "🏺",
                        "count": 0,
                        "pdfs": []
                    },
                    "Tamil Grammar": {
                        "name": "Tamil Grammar",
                        "description": "Tamil language and grammar",
                        "icon": "📖",
                        "count": 0,
                        "pdfs": []
                    },
                    "English Translations": {
                        "name": "English Translations",
                        "description": "English translations of Tamil works",
                        "icon": "🌐",
                        "count": 0,
                        "pdfs": []
                    }
                },
                "pdfs": []
            }
    
    def save_data(self):
        """Save PDF data to JSON file"""
        # Update category counts
        self.update_category_counts()
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(self.json_file), exist_ok=True)
        
        with open(self.json_file, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Data saved to {self.json_file}")
    
    def update_category_counts(self):
        """Update the count of PDFs in each category"""
        for category_name in self.data["categories"]:
            count = len([pdf for pdf in self.data["pdfs"] if pdf["category"] == category_name])
            self.data["categories"][category_name]["count"] = count
    
    def add_pdf(self, title, category, author="Unknown Author", description="", 
                tags=None, fileSize="Unknown", pages=0, year=2024, language="Tamil",
                viewUrl="", downloadUrl="", thumbnailUrl="", featured=False):
        """
        Add a new PDF to the database
        
        Args:
            title (str): PDF title
            category (str): Category name (must match existing categories)
            author (str): Author name
            description (str): PDF description
            tags (list): List of tags
            fileSize (str): File size (e.g., "2.5 MB")
            pages (int): Number of pages
            year (int): Publication year
            language (str): Language of the PDF
            viewUrl (str): URL to view the PDF
            downloadUrl (str): URL to download the PDF
            thumbnailUrl (str): URL to thumbnail image
            featured (bool): Whether this PDF is featured
        """
        # Validate category
        if category not in self.data["categories"]:
            print(f"❌ Invalid category: {category}")
            print(f"Available categories: {list(self.data['categories'].keys())}")
            return False
        
        # Generate unique ID
        pdf_id = str(uuid.uuid4())[:12]
        
        # Create PDF entry
        pdf_entry = {
            "id": pdf_id,
            "title": title,
            "author": author,
            "category": category,
            "description": description,
            "tags": tags or [],
            "fileSize": fileSize,
            "pages": pages,
            "language": language,
            "year": year,
            "viewUrl": viewUrl or f"assets/pdfs/{category.lower().replace(' ', '_')}/{title.lower().replace(' ', '_')}.pdf",
            "downloadUrl": downloadUrl or f"assets/pdfs/{category.lower().replace(' ', '_')}/{title.lower().replace(' ', '_')}.pdf",
            "thumbnailUrl": thumbnailUrl or f"assets/images/thumbnails/{pdf_id}.jpg",
            "addedDate": datetime.now().strftime("%Y-%m-%d"),
            "downloads": 0,
            "rating": 0.0,
            "featured": featured
        }
        
        # Add to database
        self.data["pdfs"].append(pdf_entry)
        
        print(f"✅ Added: {title} ({category})")
        return True
    
    def add_pdfs_by_category(self, category_pdfs):
        """
        Add multiple PDFs organized by category
        
        Args:
            category_pdfs (dict): Dictionary with category as key and list of PDFs as value
                Example: {
                    "Poems": [
                        {"title": "Poem 1", "author": "Author 1"},
                        {"title": "Poem 2", "author": "Author 2"}
                    ],
                    "Literature": [
                        {"title": "Book 1", "author": "Author 3"}
                    ]
                }
        """
        total_added = 0
        
        for category, pdfs in category_pdfs.items():
            print(f"\n📚 Adding PDFs to category: {category}")
            print("-" * 40)
            
            for pdf_info in pdfs:
                success = self.add_pdf(
                    title=pdf_info.get("title", "Untitled"),
                    category=category,
                    author=pdf_info.get("author", "Unknown Author"),
                    description=pdf_info.get("description", ""),
                    tags=pdf_info.get("tags", []),
                    fileSize=pdf_info.get("fileSize", "Unknown"),
                    pages=pdf_info.get("pages", 0),
                    year=pdf_info.get("year", 2024),
                    language=pdf_info.get("language", "Tamil"),
                    featured=pdf_info.get("featured", False)
                )
                if success:
                    total_added += 1
        
        self.save_data()
        print(f"\n🎉 Successfully added {total_added} PDFs!")
        return total_added
    
    def get_pdfs_by_category(self, category):
        """Get all PDFs in a specific category"""
        return [pdf for pdf in self.data["pdfs"] if pdf["category"] == category]
    
    def get_category_stats(self):
        """Get statistics for all categories"""
        stats = {}
        for category_name in self.data["categories"]:
            pdfs = self.get_pdfs_by_category(category_name)
            stats[category_name] = {
                "count": len(pdfs),
                "featured": len([p for p in pdfs if p.get("featured", False)]),
                "total_downloads": sum(p.get("downloads", 0) for p in pdfs),
                "avg_rating": sum(p.get("rating", 0) for p in pdfs) / len(pdfs) if pdfs else 0
            }
        return stats
    
    def print_category_stats(self):
        """Print statistics for all categories"""
        stats = self.get_category_stats()
        print("\n📊 CATEGORY STATISTICS")
        print("=" * 50)
        
        for category, stat in stats.items():
            print(f"{category}:")
            print(f"  📄 Total PDFs: {stat['count']}")
            print(f"  ⭐ Featured: {stat['featured']}")
            print(f"  📥 Total Downloads: {stat['total_downloads']}")
            print(f"  ⭐ Average Rating: {stat['avg_rating']:.1f}")
            print()

if __name__ == "__main__":
    # Example usage
    manager = PDFManager()
    
    # Example: Add PDFs by category
    sample_pdfs = {
        "Poems": [
            {
                "title": "Bharathiyar Kavithaigal - Volume 1",
                "author": "Mahakavi Bharathiyar",
                "description": "Collection of patriotic poems by Bharathiyar",
                "tags": ["bharathiyar", "patriotic", "independence"],
                "featured": True
            },
            {
                "title": "Bharathidasan Poems",
                "author": "Kaviarasu Bharathidasan",
                "description": "Modern Tamil poetry collection",
                "tags": ["bharathidasan", "modern", "poetry"]
            }
        ],
        "Literature": [
            {
                "title": "Silapathikaram",
                "author": "Ilango Adigal",
                "description": "One of the five great epics of Tamil literature",
                "tags": ["epic", "classic", "ancient"],
                "featured": True
            }
        ]
    }
    
    manager.add_pdfs_by_category(sample_pdfs)
    manager.print_category_stats() 
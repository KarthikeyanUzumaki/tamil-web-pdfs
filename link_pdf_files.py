#!/usr/bin/env python3
"""
PDF File Linker
Links existing PDF files with their metadata in the JSON database
"""

import os
import json
from pathlib import Path

def scan_pdf_files():
    """Scan all PDF files in the pdfs directory"""
    pdf_files = {}
    
    pdf_dir = Path("pdfs")
    if not pdf_dir.exists():
        print("❌ 'pdfs' directory not found!")
        return pdf_files
    
    # Scan each category folder
    for category_folder in pdf_dir.iterdir():
        if category_folder.is_dir():
            category_name = category_folder.name
            pdf_files[category_name] = []
            
            # Find all PDF files in this category
            for pdf_file in category_folder.glob("*.pdf"):
                pdf_files[category_name].append({
                    "filename": pdf_file.name,
                    "path": str(pdf_file),
                    "size": pdf_file.stat().st_size
                })
                print(f"Found: {category_name}/{pdf_file.name}")
    
    return pdf_files

def update_pdf_urls():
    """Update PDF URLs in the JSON database to match actual files"""
    # Load current JSON data
    try:
        with open("assets/data/pdfs.json", "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ assets/data/pdfs.json not found!")
        return
    
    # Scan actual PDF files
    pdf_files = scan_pdf_files()
    
    print("📁 Found PDF files:")
    for category, files in pdf_files.items():
        print(f"\n{category}:")
        for file_info in files:
            print(f"  📄 {file_info['filename']} ({file_info['size']} bytes)")
    
    # Update URLs for existing PDFs
    updated_count = 0
    for pdf in data["pdfs"]:
        category = pdf["category"]
        if category in pdf_files:
            # Try to find matching PDF file
            pdf_title = pdf["title"].lower().replace(" ", "_").replace("-", "_")
            
            for file_info in pdf_files[category]:
                filename = file_info["filename"].lower().replace(".pdf", "")
                
                # Simple matching logic
                if (pdf_title in filename or 
                    filename in pdf_title or 
                    any(word in filename for word in pdf_title.split("_"))):
                    
                    # Update URLs
                    old_view_url = pdf["viewUrl"]
                    old_download_url = pdf["downloadUrl"]
                    
                    pdf["viewUrl"] = f"pdfs/{category}/{file_info['filename']}"
                    pdf["downloadUrl"] = f"pdfs/{category}/{file_info['filename']}"
                    
                    print(f"✅ Updated: {pdf['title']}")
                    print(f"   Old: {old_view_url}")
                    print(f"   New: {pdf['viewUrl']}")
                    updated_count += 1
                    break
    
    # Save updated data
    with open("assets/data/pdfs.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n🎉 Updated {updated_count} PDF URLs!")

def add_missing_pdfs():
    """Add metadata for PDF files that don't have entries"""
    # Load current JSON data
    try:
        with open("assets/data/pdfs.json", "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ assets/data/pdfs.json not found!")
        return
    
    # Scan actual PDF files
    pdf_files = scan_pdf_files()
    
    added_count = 0
    
    for category, files in pdf_files.items():
        print(f"\n📚 Processing category: {category}")
        
        for file_info in files:
            filename = file_info["filename"]
            
            # Check if this PDF already has metadata
            existing = False
            for pdf in data["pdfs"]:
                if (pdf["category"] == category and 
                    filename in pdf["viewUrl"]):
                    existing = True
                    break
            
            if not existing:
                # Add new PDF entry
                import uuid
                from datetime import datetime
                
                # Create title from filename
                title = filename.replace(".pdf", "").replace("_", " ").title()
                
                new_pdf = {
                    "id": str(uuid.uuid4())[:12],
                    "title": title,
                    "author": "Unknown Author",
                    "category": category,
                    "description": f"PDF file: {filename}",
                    "tags": [category.lower(), "pdf"],
                    "fileSize": f"{file_info['size']} bytes",
                    "pages": 0,
                    "language": "Tamil",
                    "year": 2024,
                    "viewUrl": f"pdfs/{category}/{filename}",
                    "downloadUrl": f"pdfs/{category}/{filename}",
                    "thumbnailUrl": f"assets/images/thumbnails/{filename.replace('.pdf', '.jpg')}",
                    "addedDate": datetime.now().strftime("%Y-%m-%d"),
                    "downloads": 0,
                    "rating": 0.0,
                    "featured": False
                }
                
                data["pdfs"].append(new_pdf)
                print(f"✅ Added: {title}")
                added_count += 1
    
    if added_count > 0:
        # Save updated data
        with open("assets/data/pdfs.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"\n🎉 Added {added_count} new PDF entries!")
    else:
        print("\n✅ All PDF files already have metadata entries!")

def show_pdf_status():
    """Show status of PDF files vs metadata"""
    # Load current JSON data
    try:
        with open("assets/data/pdfs.json", "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ assets/data/pdfs.json not found!")
        return
    
    # Scan actual PDF files
    pdf_files = scan_pdf_files()
    
    print("📊 PDF STATUS REPORT")
    print("=" * 50)
    
    for category in data["categories"]:
        print(f"\n{category}:")
        
        # Count PDFs in JSON
        json_count = len([p for p in data["pdfs"] if p["category"] == category])
        
        # Count actual PDF files
        file_count = len(pdf_files.get(category, []))
        
        print(f"  📄 JSON entries: {json_count}")
        print(f"  📁 Actual files: {file_count}")
        
        if json_count != file_count:
            print(f"  ⚠️  MISMATCH! {abs(json_count - file_count)} {'missing files' if file_count < json_count else 'missing entries'}")
        
        # Show actual files
        if category in pdf_files:
            for file_info in pdf_files[category]:
                print(f"    📄 {file_info['filename']}")

if __name__ == "__main__":
    print("🔗 PDF FILE LINKER")
    print("=" * 30)
    print("1. Show PDF status")
    print("2. Update PDF URLs")
    print("3. Add missing PDF entries")
    print("4. Do everything")
    
    choice = input("\nEnter your choice (1-4): ").strip()
    
    if choice == "1":
        show_pdf_status()
    elif choice == "2":
        update_pdf_urls()
    elif choice == "3":
        add_missing_pdfs()
    elif choice == "4":
        show_pdf_status()
        update_pdf_urls()
        add_missing_pdfs()
    else:
        print("❌ Invalid choice!") 
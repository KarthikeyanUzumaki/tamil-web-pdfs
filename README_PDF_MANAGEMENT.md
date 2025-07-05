# Tamil PDF Library - PDF Management Guide

## Overview
This guide explains how to add PDFs organized by category to your Tamil PDF Library website.

## Available Categories
Your website supports 6 main categories:
1. **Poems** 📝 - Tamil poetry and verses
2. **Literature** 📚 - Tamil literature and novels  
3. **Thirukkural** 🏛️ - Thiruvalluvar's Thirukkural
4. **History** 🏺 - Tamil history and heritage
5. **Tamil Grammar** 📖 - Tamil language and grammar
6. **English Translations** 🌐 - English translations of Tamil works

## Methods to Add PDFs by Category

### Method 1: Interactive Python Script (Recommended)

Use the interactive script for easy PDF management:

```bash
python add_pdfs_by_category.py
```

**Features:**
- Interactive menu system
- Add multiple PDFs to any category
- View category statistics
- Automatic JSON file updates

**Steps:**
1. Run the script
2. Choose "Interactive mode"
3. Select a category
4. Enter PDF details (title, author, description, tags)
5. Repeat for multiple PDFs
6. View statistics

### Method 2: Batch Import from CSV

Use the batch import script for large numbers of PDFs:

```bash
python batch_add_pdfs.py
```

**Features:**
- Import from CSV files
- Create sample CSV templates
- Add sample PDFs automatically

### Method 3: Direct JSON Editing

Edit `assets/data/pdfs.json` directly for advanced users:

```json
{
  "id": "unique_id",
  "title": "PDF Title",
  "author": "Author Name", 
  "category": "Category Name",
  "description": "Description",
  "tags": ["tag1", "tag2"],
  "fileSize": "2.5 MB",
  "pages": 125,
  "language": "Tamil",
  "year": 2024,
  "viewUrl": "assets/pdfs/category/filename.pdf",
  "downloadUrl": "assets/pdfs/category/filename.pdf",
  "thumbnailUrl": "assets/images/thumbnails/filename.jpg",
  "addedDate": "2024-01-15",
  "downloads": 0,
  "rating": 0.0,
  "featured": false
}
```

## File Organization Structure

```
tamil-pdf-website/
├── assets/
│   ├── data/
│   │   └── pdfs.json          # Main PDF database
│   ├── pdfs/                  # PDF files organized by category
│   │   ├── poems/
│   │   ├── literature/
│   │   ├── thirukkural/
│   │   ├── history/
│   │   ├── tamil_grammar/
│   │   └── english_translations/
│   └── images/
│       └── thumbnails/        # PDF thumbnail images
├── pdf_manager.py             # PDF management class
├── add_pdfs_by_category.py    # Interactive PDF manager
└── batch_add_pdfs.py          # Batch import script
```

## Quick Start Examples

### Example 1: Add a Single PDF to Poems Category

```python
from pdf_manager import PDFManager

manager = PDFManager()

manager.add_pdf(
    title="Bharathiyar Kavithaigal - Volume 1",
    category="Poems",
    author="Mahakavi Bharathiyar",
    description="Collection of patriotic poems by Bharathiyar",
    tags=["bharathiyar", "patriotic", "independence"],
    featured=True
)

manager.save_data()
```

### Example 2: Add Multiple PDFs by Category

```python
from pdf_manager import PDFManager

manager = PDFManager()

category_pdfs = {
    "Poems": [
        {
            "title": "Bharathiyar Poems",
            "author": "Mahakavi Bharathiyar",
            "description": "Modern Tamil poetry",
            "tags": ["bharathiyar", "poetry"],
            "featured": True
        }
    ],
    "Literature": [
        {
            "title": "Silapathikaram",
            "author": "Ilango Adigal", 
            "description": "Classic Tamil epic",
            "tags": ["epic", "classic"],
            "featured": True
        }
    ]
}

manager.add_pdfs_by_category(category_pdfs)
```

### Example 3: View Category Statistics

```python
from pdf_manager import PDFManager

manager = PDFManager()
manager.print_category_stats()
```

## CSV Import Format

Create a CSV file with these columns:

```csv
title,category,author,description,tags,fileSize,pages,year,language
Bharathiyar Kavithaigal Volume 1,Poems,Mahakavi Bharathiyar,Collection of patriotic poems,bharathiyar;patriotic;independence,2.5 MB,125,1908,Tamil
Silapathikaram,Literature,Ilango Adigal,One of the five great epics,epic;classic;ancient,8.2 MB,456,200,Tamil
```

## Best Practices

### 1. File Naming
- Use descriptive, consistent file names
- Include category in file path: `assets/pdfs/poems/bharathiyar_vol1.pdf`

### 2. Metadata
- Provide detailed descriptions
- Use relevant tags for better searchability
- Set appropriate featured flags for important works

### 3. Organization
- Keep PDFs organized in category folders
- Maintain consistent thumbnail naming
- Update category counts automatically

### 4. Content Quality
- Verify PDF file integrity
- Ensure proper Tamil text encoding
- Include author information when available

## Troubleshooting

### Common Issues

1. **Invalid Category Error**
   - Ensure category name matches exactly (case-sensitive)
   - Available categories: Poems, Literature, Thirukkural, History, Tamil Grammar, English Translations

2. **JSON File Not Found**
   - The system will create a new `pdfs.json` file automatically
   - Ensure write permissions in the `assets/data/` directory

3. **Duplicate PDFs**
   - Each PDF gets a unique ID automatically
   - Check titles to avoid confusion

### Getting Help

- Run `python add_pdfs_by_category.py` and choose option 3 to view current statistics
- Check the `assets/data/pdfs.json` file for the current database structure
- Use the interactive mode for step-by-step guidance

## Advanced Features

### Custom Categories
To add new categories, edit the `pdf_manager.py` file and add to the categories dictionary:

```python
"New Category": {
    "name": "New Category",
    "description": "Description of new category",
    "icon": "📄",
    "count": 0,
    "pdfs": []
}
```

### Bulk Operations
Use the batch import script for large-scale operations:

```bash
python batch_add_pdfs.py
# Choose option 1 for CSV import
# Choose option 2 to create sample CSV
# Choose option 3 for sample PDFs
```

This system provides a flexible and scalable way to manage your Tamil PDF library with proper categorization and metadata management. 
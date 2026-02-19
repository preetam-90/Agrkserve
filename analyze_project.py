#!/usr/bin/env python3
"""
Comprehensive Project Code Statistics Analyzer
Generates a beautiful, modern PROJECT_CODE_STATISTICS.md
"""

import os
import re
import json
import glob
from pathlib import Path
from datetime import datetime
from collections import defaultdict, Counter
from typing import Dict, List, Tuple, Optional

# ============ CONFIGURATION ============
PROJECT_ROOT = "/home/pk/Projects/Agrkserve"

# Directories to exclude (common build/output/venv folders)
EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    "coverage",
    "venv",
    ".venv",
    ".vercel",
    "__pycache__",
    ".pytest_cache",
    "testsprite_tests/tmp",
    ".desloppify",
    ".claude",
    ".agents",
    ".opencodeskills",
    ".sisyphus",
    ".cache",
    "target",
    "out",
}

# File extensions to analyze (source code and docs)
SOURCE_EXTENSIONS = {
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".py",
    ".sh",
    ".mjs",
    ".cjs",
    ".css",
    ".scss",
    ".sass",
    ".less",
    ".styl",
    ".md",
    ".json",
    ".yml",
    ".yaml",
    ".toml",
    ".ini",
    ".cfg",
    ".html",
    ".htm",
    ".xml",
    ".svg",
    ".vue",
    ".svelte",
    ".astro",
    ".rs",
    ".go",
    ".java",
    ".cpp",
    ".c",
    ".h",
    ".hpp",
    ".php",
    ".rb",
    ".perl",
    ".pl",
    ".lua",
    ".r",
    ".sql",
}

# Binary/image files to skip (but count as files)
SKIP_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".avif",
    ".ico",
    ".svg",
    ".pdf",
    ".zip",
    ".tar",
    ".gz",
    ".tgz",
    ".rar",
    ".7z",
    ".exe",
    ".dll",
    ".so",
    ".dylib",
    ".bin",
    ".obj",
    ".lib",
    ".class",
    ".jar",
    ".war",
    ".ear",
    ".pyc",
    ".pyo",
    ".mp3",
    ".mp4",
    ".avi",
    ".mov",
    ".wmv",
    ".flv",
    ".webm",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".otf",
    ".glb",
    ".gltf",
    ".3d",
    ".3ds",
    ".obj",
    ".mtl",
}

# Comment patterns per file extension
COMMENT_PATTERNS = {
    ".ts": ("//", "/*", "*/"),
    ".tsx": ("//", "/*", "*/"),
    ".js": ("//", "/*", "*/"),
    ".jsx": ("//", "/*", "*/"),
    ".mjs": ("//", "/*", "*/"),
    ".cjs": ("//", "/*", "*/"),
    ".py": ("#", '"""', '"""', "'''", "'''"),
    ".sh": ("#",),
    ".bash": ("#",),
    ".zsh": ("#",),
    ".css": ("/*", "*/"),
    ".scss": ("//", "/*", "*/"),
    ".sass": ("//",),
    ".less": ("//", "/*", "*/"),
    ".styl": ("//", "/*", "*/"),
    ".rs": ("//", "/*", "*/"),
    ".go": ("//", "/*", "*/"),
    ".java": ("//", "/*", "*/"),
    ".c": ("//", "/*", "*/"),
    ".cpp": ("//", "/*", "*/"),
    ".h": ("//", "/*", "*/"),
    ".hpp": ("//", "/*", "*/"),
    ".php": ("//", "/*", "*/"),
    ".rb": ("#", "=begin", "=end"),
    ".sql": ("--", "/*", "*/"),
}

# Detect test files
TEST_PATTERNS = [
    re.compile(r"\.test\.(ts|tsx|js|jsx|py)$", re.IGNORECASE),
    re.compile(r"\.spec\.(ts|tsx|js|jsx|py)$", re.IGNORECASE),
    re.compile(r"/tests?/", re.IGNORECASE),
    re.compile(r"/__tests?__/", re.IGNORECASE),
    re.compile(r"test_", re.IGNORECASE),
    re.compile(r"_test\.", re.IGNORECASE),
]


# ============ DATA STRUCTURES ============
class FileStats:
    def __init__(self, path: str):
        self.path = path
        self.extension = Path(path).suffix.lower()
        self.total_lines = 0
        self.code_lines = 0
        self.comment_lines = 0
        self.blank_lines = 0
        self.characters = 0
        self.file_size = 0
        self.todo_count = 0
        self.fixme_count = 0


class ProjectAnalyzer:
    def __init__(self):
        self.files = []
        self.total_files = 0
        self.total_lines = 0
        self.total_code_lines = 0
        self.total_comment_lines = 0
        self.total_blank_lines = 0
        self.total_characters = 0
        self.total_size = 0
        self.directories = defaultdict(
            lambda: {"files": 0, "lines": 0, "characters": 0}
        )
        self.file_extensions = Counter()
        self.test_files = 0
        self.todo_count = 0
        self.fixme_count = 0
        self.largest_files = []
        self.smallest_files = []
        self.line_lengths = {"max": 0, "min": float("inf")}

    def should_analyze_file(self, filepath: str) -> bool:
        """Check if file should be analyzed"""
        path = Path(filepath)

        # Check extension
        if path.suffix.lower() in SKIP_EXTENSIONS:
            return False

        # Check exclude directories
        for part in path.parts:
            if part in EXCLUDE_DIRS:
                return False

        # Only analyze source files (or markdown/docs)
        if path.suffix.lower() not in SOURCE_EXTENSIONS:
            return False

        return True

    def count_file_lines(self, filepath: str, ext: str) -> Tuple[int, int, int, int]:
        """Count total, code, comment, and blank lines"""
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                lines = f.readlines()
        except Exception:
            return 0, 0, 0, 0

        total_lines = len(lines)
        code_lines = 0
        comment_lines = 0
        blank_lines = 0

        # Get comment patterns for this extension
        patterns = COMMENT_PATTERNS.get(ext, ("//", "/*", "*/"))

        in_multiline_comment = False
        multiline_start = ""

        for line in lines:
            stripped = line.strip()

            # Blank line
            if not stripped:
                blank_lines += 1
                continue

            # Check for multi-line comment start/end
            if in_multiline_comment:
                comment_lines += 1
                if multiline_start in stripped:
                    in_multiline_comment = False
                continue

            # Single-line comment
            if stripped.startswith(patterns[0]):
                comment_lines += 1
                continue

            # Multi-line comment start
            if len(patterns) > 1 and patterns[1] in stripped:
                comment_lines += 1
                if patterns[2] not in stripped:
                    in_multiline_comment = True
                    multiline_start = patterns[2]
                continue

            # It's a code line
            code_lines += 1

        return total_lines, code_lines, comment_lines, blank_lines

    def analyze_file(self, filepath: str):
        """Analyze a single file"""
        try:
            # Get file stats
            stat = os.stat(filepath)
            file_size = stat.st_size

            # Read file
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            ext = Path(filepath).suffix.lower()

            # Count lines
            total_lines = content.count("\n") + (
                1 if content and not content.endswith("\n") else 0
            )
            lines_list = content.splitlines()

            # Classify lines
            code_lines, comment_lines, blank_lines = self.classify_lines(
                lines_list, ext
            )

            # Count TODOs and FIXMEs
            todo_count = len(re.findall(r"TODO|todo|To-?Do", content))
            fixme_count = len(re.findall(r"FIXME|fixme", content))

            # Track line lengths
            for line in lines_list:
                if line.strip():
                    line_len = len(line)
                    self.line_lengths["max"] = max(self.line_lengths["max"], line_len)
                    self.line_lengths["min"] = min(self.line_lengths["min"], line_len)

            # Create file stats
            file_stats = {
                "path": filepath.replace(PROJECT_ROOT + "/", ""),
                "extension": ext,
                "totalLines": total_lines,
                "codeLines": code_lines,
                "commentLines": comment_lines,
                "blankLines": blank_lines,
                "characters": len(content),
                "fileSize": file_size,
                "todoCount": todo_count,
                "fixmeCount": fixme_count,
            }

            self.files.append(file_stats)

            # Update totals
            self.total_files += 1
            self.total_lines += total_lines
            self.total_code_lines += code_lines
            self.total_comment_lines += comment_lines
            self.total_blank_lines += blank_lines
            self.total_characters += len(content)
            self.total_size += file_size
            self.todo_count += todo_count
            self.fixme_count += fixme_count

            # Update extension counter
            self.file_extensions[ext] += 1

            # Update directory stats
            rel_path = filepath.replace(PROJECT_ROOT + "/", "")
            dir_path = str(Path(rel_path).parent)
            if dir_path == ".":
                dir_path = ""
            self.directories[dir_path]["files"] += 1
            self.directories[dir_path]["lines"] += total_lines
            self.directories[dir_path]["characters"] += len(content)

            # Track test files
            if self.is_test_file(filepath):
                self.test_files += 1

            # Track largest/smallest files (by lines)
            if len(self.largest_files) < 10:
                self.largest_files.append(file_stats)
            else:
                min_largest = min(self.largest_files, key=lambda x: x["totalLines"])
                if total_lines > min_largest["totalLines"]:
                    self.largest_files.remove(min_largest)
                    self.largest_files.append(file_stats)

            if len(self.smallest_files) < 5:
                self.smallest_files.append(file_stats)
            else:
                max_smallest = max(self.smallest_files, key=lambda x: x["totalLines"])
                if total_lines < max_smallest["totalLines"]:
                    self.smallest_files.remove(max_smallest)
                    self.smallest_files.append(file_stats)

        except Exception as e:
            pass  # Skip files with errors

    def classify_lines(self, lines: List[str], ext: str) -> Tuple[int, int, int]:
        """Classify lines as code, comment, or blank"""
        patterns = COMMENT_PATTERNS.get(ext, ("//", "/*", "*/"))
        code_lines = 0
        comment_lines = 0
        blank_lines = 0

        in_multiline = False
        multiline_end = patterns[2] if len(patterns) > 2 else ""

        for line in lines:
            stripped = line.strip()

            if not stripped:
                blank_lines += 1
                continue

            if in_multiline:
                comment_lines += 1
                if multiline_end in line:
                    in_multiline = False
                continue

            if stripped.startswith(patterns[0]):
                comment_lines += 1
                continue

            if len(patterns) > 1 and patterns[1] in stripped:
                comment_lines += 1
                if multiline_end and multiline_end in line:
                    pass  # Single line comment with both start and end
                else:
                    in_multiline = True
                continue

            code_lines += 1

        return code_lines, comment_lines, blank_lines

    def is_test_file(self, filepath: str) -> bool:
        """Check if file is a test file"""
        for pattern in TEST_PATTERNS:
            if pattern.search(filepath):
                return True
        return False

    def scan_project(self):
        """Recursively scan project and analyze files"""
        print(f"Scanning project: {PROJECT_ROOT}")

        for root, dirs, files in os.walk(PROJECT_ROOT):
            # Skip excluded directories
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

            for file in files:
                filepath = os.path.join(root, file)

                if self.should_analyze_file(filepath):
                    self.analyze_file(filepath)

        print(f"Analyzed {self.total_files} files")

    def generate_report(self) -> str:
        """Generate the markdown report"""
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        project_name = Path(PROJECT_ROOT).name

        # Calculate averages
        avg_lines = self.total_lines / self.total_files if self.total_files else 0
        avg_chars = self.total_characters / self.total_files if self.total_files else 0

        # Format file size
        total_size_mb = self.total_size / (1024 * 1024)
        avg_file_size = self.total_size / self.total_files if self.total_files else 0

        # Build report
        report = f"""# 📊 Project Code Statistics
        
**Generated on:** {now}  
**Project:** `{project_name}`  
**Analyzer:** `Kilo Code Statistics Analyzer v1.0`

---

## 📈 Overview

<div align="center">

| Metric | Value |
|--------|-------|
| **📁 Total Files** | `{self.total_files:,}` |
| **📂 Total Directories** | `{len([d for d in self.directories if d])}` |
| **📝 Total Lines** | `{self.total_lines:,}` |
| **💻 Code Lines** | `{self.total_code_lines:,}` |
| **📄 Comment Lines** | `{self.total_comment_lines:,}` |
| | **Blank Lines** | `{self.total_blank_lines:,}` |
| **🔤 Total Characters** | `{self.total_characters:,}` |
| **💾 Total Size** | `{total_size_mb:.2f} MB` |
| **🐛 TODO Count** | `{self.todo_count:,}` |
| **🔧 FIXME Count** | `{self.fixme_count:,}` |
| **🧪 Test Files** | `{self.test_files:,}` |

</div>

---

## 📁 Directory Breakdown

<details>
<summary><b>Click to expand all directories</b></summary>

| Directory | Files | Lines | Characters | % of Project |
|-----------|-------|-------|------------|--------------|
"""

        # Sort directories by lines descending, filter out venv/build
        sorted_dirs = sorted(
            [
                (d, v)
                for d, v in self.directories.items()
                if not any(
                    ex in d
                    for ex in [
                        "venv",
                        ".venv",
                        "node_modules",
                        ".git",
                        "dist",
                        "build",
                        ".next",
                    ]
                )
            ],
            key=lambda x: x[1]["lines"],
            reverse=True,
        )

        for dir_path, stats in sorted_dirs[:50]:  # Show top 50
            pct_lines = (
                (stats["lines"] / self.total_lines * 100) if self.total_lines else 0
            )
            display_path = dir_path if dir_path else "(root)"
            report += f"| `{display_path}` | {stats['files']:,} | {stats['lines']:,} | {stats['characters']:,} | {pct_lines:.1f}% |\n"

        report += """
</details>

---

## 📂 File Type Analysis

<details>
<summary><b>Click to expand file types</b></summary>

| Extension | Files | Lines | Code Lines | Characters | % of Files | % of Lines |
|-----------|-------|-------|------------|------------|------------|------------|
"""

        # Sort file types by count
        sorted_exts = sorted(
            self.file_extensions.items(), key=lambda x: x[1], reverse=True
        )

        for ext, count in sorted_exts:
            ext_lines = sum(
                f["totalLines"] for f in self.files if f["extension"] == ext
            )
            ext_code_lines = sum(
                f["codeLines"] for f in self.files if f["extension"] == ext
            )
            ext_chars = sum(
                f["characters"] for f in self.files if f["extension"] == ext
            )
            pct_files = (count / self.total_files * 100) if self.total_files else 0
            pct_lines = (ext_lines / self.total_lines * 100) if self.total_lines else 0

            # Simple progress bar
            bar = "█" * int(pct_files / 2) + "░" * (50 - int(pct_files / 2))
            report += f"| `{ext}` | {count:,} | {ext_lines:,} | {ext_code_lines:,} | {ext_chars:,} | {pct_files:.1f}% | {pct_lines:.1f}% | {bar} |\n"

        report += """
</details>

---

## 🔝 Top 10 Largest Files

<details>
<summary><b>Click to expand</b></summary>

| File | Lines | Characters | Size (KB) |
|------|-------|------------|-----------|
"""

        largest_sorted = sorted(
            self.files, key=lambda x: x["totalLines"], reverse=True
        )[:10]
        for f in largest_sorted:
            size_kb = f["fileSize"] / 1024
            report += f"| `{f['path']}` | {f['totalLines']:,} | {f['characters']:,} | {size_kb:.1f} KB |\n"

        report += """
</details>

---

## 🔸 Smallest Files

<details>
<summary><b>Click to expand</b></summary>

| File | Lines | Characters |
|------|-------|------------|
"""

        smallest_sorted = sorted(self.files, key=lambda x: x["totalLines"])[:10]
        for f in smallest_sorted:
            report += f"| `{f['path']}` | {f['totalLines']:,} | {f['characters']:,} |\n"

        report += """
</details>

---

## 📊 Line Distribution

<div align="center">

| Type | Lines | Percentage | Visual |
|------|-------|------------|--------|
| **💻 Code** | {code:,} | {code_pct:.1f}% | `{code_bar}` |
| **📝 Comments** | {comment:,} | {comment_pct:.1f}% | `{comment_bar}` |
| **⬜ Blank** | {blank:,} | {blank_pct:.1f}% | `{blank_bar}` |
| **Total** | {total:,} | 100% | |

</div>

---

## 🧪 Code Quality Indicators

| Indicator | Count |
|-----------|-------|
| **🐛 TODOs** | {todo} |
| **🔧 FIXMEs** | {fixme} |
| **🧪 Test Files** | {test_files} |
| **📊 Source vs Test Ratio** | {src_test_ratio:.2f}:1 |
| **📈 Code Density** | {code_density:.1f}% |

---

## 📈 Project Summary

<div align="center">

| Statistic | Value |
|-----------|-------|
| **🏗️ Project Size** | {size_mb:.2f} MB |
| **📏 Avg Lines/File** | {avg_lines:.1f} |
| **🔤 Avg Characters/File** | {avg_chars:.1f} |
| **📐 Avg File Size** | {avg_kb:.1f} KB |
| **🎯 Most Common Type** | `{most_common_ext}` |
| **🔢 Extensions Used** | {ext_count} |
| **🧪 Test Coverage** | {test_pct:.1f}% |
| **⏱️ Scan Date** | {date} |

</div>

---

## 📋 File Statistics (All Files)

<details>
<summary><b>Click to expand full table ({files_count} files)</b></summary>

| File Path | Ext | Lines | Code | Comment | Blank | Chars | Size (KB) |
|-----------|-----|-------|------|---------|-------|-------|-----------|
"""

        # Sort by lines descending
        files_sorted = sorted(self.files, key=lambda x: x["totalLines"], reverse=True)

        for f in files_sorted:
            size_kb = f["fileSize"] / 1024
            report += f"| `{f['path']}` | `{f['extension']}` | {f['totalLines']:,} | {f['codeLines']:,} | {f['commentLines']:,} | {f['blankLines']:,} | {f['characters']:,} | {size_kb:.1f} |\n"

        report += """
</details>

---

<div align="center">

**Generated with ❤️ by Kilo Code Statistics Analyzer**

</div>
"""

        # Format the report with calculated values
        code_pct = (
            (self.total_code_lines / self.total_lines * 100) if self.total_lines else 0
        )
        comment_pct = (
            (self.total_comment_lines / self.total_lines * 100)
            if self.total_lines
            else 0
        )
        blank_pct = (
            (self.total_blank_lines / self.total_lines * 100) if self.total_lines else 0
        )

        # Create progress bars
        code_bar = "█" * int(code_pct / 2) + "░" * (50 - int(code_pct / 2))
        comment_bar = "█" * int(comment_pct / 2) + "░" * (50 - int(comment_pct / 2))
        blank_bar = "█" * int(blank_pct / 2) + "░" * (50 - int(blank_pct / 2))

        # Source vs test ratio
        source_files = self.total_files - self.test_files
        src_test_ratio = (
            source_files / self.test_files if self.test_files else source_files
        )

        # Most common extension
        most_common_ext = (
            self.file_extensions.most_common(1)[0]
            if self.file_extensions
            else ("none", 0)
        )
        most_common_str = f"{most_common_ext[0]} ({most_common_ext[1]} files)"

        # Code density
        code_density = (
            (self.total_code_lines / self.total_lines * 100) if self.total_lines else 0
        )

        # Format report with values
        report = report.format(
            code=self.total_code_lines,
            code_pct=code_pct,
            code_bar=code_bar,
            comment=self.total_comment_lines,
            comment_pct=comment_pct,
            comment_bar=comment_bar,
            blank=self.total_blank_lines,
            blank_pct=blank_pct,
            blank_bar=blank_bar,
            total=self.total_lines,
            todo=self.todo_count,
            fixme=self.fixme_count,
            test_files=self.test_files,
            src_test_ratio=src_test_ratio,
            code_density=code_density,
            size_mb=total_size_mb,
            avg_lines=avg_lines,
            avg_chars=avg_chars,
            avg_kb=avg_file_size / 1024,
            most_common_ext=most_common_str,
            ext_count=len(self.file_extensions),
            test_pct=(self.test_files / self.total_files * 100)
            if self.total_files
            else 0,
            date=now,
            files_count=len(self.files),
        )

        return report


def main():
    analyzer = ProjectAnalyzer()
    analyzer.scan_project()
    report = analyzer.generate_report()

    output_file = os.path.join(PROJECT_ROOT, "PROJECT_CODE_STATISTICS.md")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"\n✅ Report generated: {output_file}")
    print(f"📊 Total files: {analyzer.total_files:,}")
    print(f"📝 Total lines: {analyzer.total_lines:,}")
    print(f"💾 Total size: {analyzer.total_size / (1024 * 1024):.2f} MB")

    return 0


if __name__ == "__main__":
    exit(main())

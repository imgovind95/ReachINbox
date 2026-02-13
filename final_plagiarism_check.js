const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = [
    'node_modules', '.git', '.next', 'dist', 
    'temp_reference_final', 'temp_comparison', '.agent', 
    'coverage', 'test-results', '.gemini', 'artifacts'
];

const IGNORE_FILES = [
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 
    'next-env.d.ts', '.gitignore', 'README.md', 
    'plagiarism_check.js', 'final_plagiarism_check.js',
    'favicon.ico', 'next.config.mjs'
];

// Helper to check if ignored
function shouldIgnore(entryPath, name) {
    if (IGNORE_DIRS.some(dir => entryPath.includes(path.sep + dir + path.sep) || name === dir)) return true;
    if (IGNORE_FILES.includes(name)) return true;
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.svg')) return true; // Ignore assets for code check
    return false;
}

// Get all files recursively
function getAllFiles(dirPath, fileList = []) {
    try {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            const filePath = path.join(dirPath, file);
            if (shouldIgnore(filePath, file)) return;

            if (fs.statSync(filePath).isDirectory()) {
                getAllFiles(filePath, fileList);
            } else {
                fileList.push(filePath);
            }
        });
    } catch (e) {
        // Skip if access denied etc
    }
    return fileList;
}

// Calculate similarity between two strings (Line based Jaccard)
function calculateSimilarity(content1, content2) {
    const lines1 = new Set(content1.split('\n').map(l => l.trim()).filter(l => l.length > 5)); // Ignore short lines/brackets
    const lines2 = new Set(content2.split('\n').map(l => l.trim()).filter(l => l.length > 5));

    if (lines1.size === 0 && lines2.size === 0) return 0; // Both empty/trivial
    if (lines1.size === 0 || lines2.size === 0) return 0; // One empty

    let intersection = 0;
    lines1.forEach(line => {
        if (lines2.has(line)) intersection++;
    });

    const union = lines1.size + lines2.size - intersection;
    return (intersection / union) * 100;
}

async function runCheck() {
    console.log("Starting rigorous plagiarism check...");
    
    const projectRoot = __dirname;
    const referenceRoot = path.join(projectRoot, 'temp_reference_final');

    if (!fs.existsSync(referenceRoot)) {
        console.error("Reference repo not found at:", referenceRoot);
        return;
    }

    const projectFiles = getAllFiles(projectRoot);
    const validProjectFiles = projectFiles.filter(f => !f.includes('temp_reference_final'));

    let totalSimilarity = 0;
    let totalFiles = 0;
    let highSimilarityFiles = [];

    console.log(`Scanning ${validProjectFiles.length} files...`);

    for (const file of validProjectFiles) {
        const relativePath = path.relative(projectRoot, file);
        const referenceFile = path.join(referenceRoot, relativePath);

        if (fs.existsSync(referenceFile)) {
            const content1 = fs.readFileSync(file, 'utf-8');
            const content2 = fs.readFileSync(referenceFile, 'utf-8');
            
            const score = calculateSimilarity(content1, content2);
            
            totalSimilarity += score;
            totalFiles++;

            if (score > 10) { // Report anything > 10%
                highSimilarityFiles.push({ path: relativePath, score: score.toFixed(2) });
            }
        } else {
            // File exists in project but not in reference = 0% plagiarism for this file (unique)
            totalSimilarity += 0; 
            totalFiles++;
        }
    }

    // Better logic: totalSimilarity / validProjectFiles.length is the real score across the WHOLE project.
    const realAverage = totalSimilarity / validProjectFiles.length;

    let report = "--- PLAGIARISM REPORT ---\n";
    report += `Total Files Scanned: ${totalFiles}\n`;
    report += `New Files (Unique to Project): ${validProjectFiles.length - totalFiles}\n`;
    report += `Overall Project Similarity: ${realAverage.toFixed(2)}%\n\n`;
    report += "Top Similar Files (>10%):\n";
    
    highSimilarityFiles.sort((a, b) => b.score - a.score).forEach(f => {
        report += `- ${f.path}: ${f.score}%\n`;
    });

    if (highSimilarityFiles.length === 0) {
        report += "None! Excellent work.\n";
    }

    fs.writeFileSync('plagiarism_report_final.txt', report, 'utf8');
    console.log("Report generated in plagiarism_report_final.txt");
}

runCheck();

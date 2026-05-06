using System.Text;
using System.Text.RegularExpressions;

namespace FileExtractor;

class Program
{
    // Supported file extensions - expanded for .NET and Angular/JS
    private static readonly Dictionary<string, string> ExtensionMap = new()
    {
        // JavaScript/TypeScript
        { "json", ".json" },
        { "typescript", ".ts" },
        { "tsx", ".tsx" },
        { "scss", ".scss" },
        { "html", ".html" },
        { "css", ".css" },
        { "js", ".js" },
        { "jsx", ".jsx" },
        { "ts", ".ts" },
        
        // .NET / C# files
        { "csharp", ".cs" },
        { "cs", ".cs" },
        { "razor", ".cshtml" },
        { "cshtml", ".cshtml" },
        { "xaml", ".xaml" },
        { "config", ".config" },
        { "csproj", ".csproj" },
        { "sln", ".sln" },
        
        // Additional web files
        { "vue", ".vue" },
        { "svelte", ".svelte" },
        { "yaml", ".yaml" },
        { "yml", ".yml" },
        { "xml", ".xml" },
        { "md", ".md" },
    };

    static void Main(string[] args)
    {
        string baseDir = AppDomain.CurrentDomain.BaseDirectory.Split("bin")[0];
        string inputFile = Path.Combine(baseDir, "input.txt");
        string outputDir = Path.Combine(baseDir, "output");

        if (!File.Exists(inputFile))
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"Error: Input file not found: {inputFile}");
            Console.ResetColor();
            return;
        }

        try
        {
            var files = ParseInputFile(inputFile);
            CreateFiles(files, outputDir);
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($"\n✓ Successfully created {files.Count} files in '{outputDir}' directory");
            Console.ResetColor();
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"Error: {ex.Message}");
            Console.ResetColor();
        }
    }

    static List<FileDefinition> ParseInputFile(string filePath)
    {
        var files = new List<FileDefinition>();
        var lines = File.ReadAllLines(filePath, Encoding.UTF8);
        int i = 0;

        while (i < lines.Length)
        {
            // Skip empty lines
            while (i < lines.Length && string.IsNullOrWhiteSpace(lines[i]))
                i++;
            if (i >= lines.Length) break;

            // Try to identify a file block
            var fileDef = TryParseFileBlock(lines, ref i);
            if (fileDef != null)
            {
                files.Add(fileDef);
            }
            else
            {
                i++;
            }
        }
        return files;
    }

    static FileDefinition? TryParseFileBlock(string[] lines, ref int startIndex)
    {
        if (startIndex >= lines.Length) return null;

        string? fileType = null;
        string[]? contentLines = null;

        // First line should be the file type
        var potentialType = lines[startIndex].Trim().ToLower();
        if (ExtensionMap.ContainsKey(potentialType))
        {
            fileType = potentialType;
            startIndex++;
        }
        else
        {
            return null;
        }

        // Skip empty lines after file type
        while (startIndex < lines.Length && string.IsNullOrWhiteSpace(lines[startIndex]))
            startIndex++;

        if (startIndex >= lines.Length) return null;

        // Extract content starting from current position
        contentLines = ExtractContent(lines, startIndex);

        // The first line of content should contain the output path
        // Format: // path/to/output/file.ts or /* path/to/output/file.ts */
        string? outputPath = ExtractOutputPathFromFirstLine(contentLines);

        if (string.IsNullOrEmpty(outputPath))
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($"Warning: No output path found in content for file type '{fileType}'. Skipping...");
            Console.ResetColor();
            startIndex += contentLines.Length;
            return null;
        }

        // Skip past the content we just processed
        startIndex += contentLines.Length;
        while (startIndex < lines.Length && string.IsNullOrWhiteSpace(lines[lines.Length > startIndex ? startIndex : startIndex - 1]))
            startIndex++;

        return new FileDefinition
        {
            FileName = outputPath,
            FileType = fileType,
            Content = string.Join(Environment.NewLine, contentLines ?? Array.Empty<string>())
        };
    }

    /// <summary>
    /// Extracts the output path from the first line of content.
    /// Supports formats: // path/to/file.ts, /* path/to/file.ts */, <!-- path/to/file.html -->
    /// </summary>
    static string? ExtractOutputPathFromFirstLine(string[] contentLines)
    {
        if (contentLines == null || contentLines.Length == 0)
            return null;

        var firstLine = contentLines[0].Trim();

        // Pattern 1: // comment style (C#, TypeScript, JavaScript, SCSS)
        var match = Regex.Match(firstLine, @"^//\s*(.+)$");
        if (match.Success)
        {
            var path = match.Groups[1].Value.Trim();
            // Validate it looks like a file path
            if (IsValidFilePath(path))
                return path;
        }

        // Pattern 2: /* comment style */ (CSS, multi-line comments)
        match = Regex.Match(firstLine, @"^/\*\s*(.+?)\s*\*/$");
        if (match.Success)
        {
            var path = match.Groups[1].Value.Trim();
            if (IsValidFilePath(path))
                return path;
        }

        // Pattern 3: <!-- HTML comment style -->
        match = Regex.Match(firstLine, @"^<!--\s*(.+?)\s*-->$");
        if (match.Success)
        {
            var path = match.Groups[1].Value.Trim();
            if (IsValidFilePath(path))
                return path;
        }

        // Pattern 4: # comment style (SCSS, Python, YAML)
        match = Regex.Match(firstLine, @"^#\s*(.+)$");
        if (match.Success)
        {
            var path = match.Groups[1].Value.Trim();
            if (IsValidFilePath(path))
                return path;
        }

        // Pattern 5: @* Razor comment style *@
        match = Regex.Match(firstLine, @"^@\*\s*(.+?)\s*\*@$");
        if (match.Success)
        {
            var path = match.Groups[1].Value.Trim();
            if (IsValidFilePath(path))
                return path;
        }

        return null;
    }

    static bool IsValidFilePath(string path)
    {
        if (string.IsNullOrWhiteSpace(path))
            return false;

        // Must have a file extension
        bool hasExtension = Regex.IsMatch(path, @"\.[a-zA-Z0-9]+$");

        // Should contain path separators or look like a file name
        bool hasPathSeparator = path.Contains('/') || path.Contains('\\');

        // Should not be actual code
        bool looksLikeCode = Regex.IsMatch(path, @"^(using|import|export|const|let|var|function|class|interface|namespace|public|private|protected)\s");

        return hasExtension && (hasPathSeparator || path.Contains('.')) && !looksLikeCode;
    }

    static string[] ExtractContent(string[] lines, int startIndex)
    {
        var content = new List<string>();

        for (int i = startIndex; i < lines.Length; i++)
        {
            string line = lines[i];

            // Stop at empty lines that are followed by another file type marker
            if (string.IsNullOrWhiteSpace(line))
            {
                // Check if next non-empty line is a file type
                int nextNonEmpty = i + 1;
                while (nextNonEmpty < lines.Length && string.IsNullOrWhiteSpace(lines[nextNonEmpty]))
                    nextNonEmpty++;

                if (nextNonEmpty < lines.Length)
                {
                    var nextLine = lines[nextNonEmpty].Trim().ToLower();
                    if (ExtensionMap.ContainsKey(nextLine))
                        break;
                }
                content.Add(line);
                continue;
            }

            // Skip metadata/UI lines
            if (line.Trim() == "Collapse" ||
                line.Trim() == "ذخیره" ||
                line.Trim() == "کپی" ||
                line.Trim() == "Copy" ||
                line.Trim() == "Save")
            {
                continue;
            }

            // Skip line numbers (single number or range)
            string trimmed = line.Trim();
            if (Regex.IsMatch(trimmed, @"^\d+$"))
                continue;

            // Skip navigation markers
            if (trimmed == "⌄" || trimmed == "v" || trimmed == "^")
                continue;

            // Remove leading line numbers from content
            string cleanedLine = Regex.Replace(line, @"^\s*\d+\s+", "");
            content.Add(cleanedLine);
        }

        return content.ToArray();
    }

    static void CreateFiles(List<FileDefinition> files, string outputDir)
    {
        // Create output directory if it doesn't exist
        if (!Directory.Exists(outputDir))
        {
            Directory.CreateDirectory(outputDir);
        }

        foreach (var file in files)
        {
            // Determine full path
            string fullPath = Path.Combine(outputDir, file.FileName);

            // Ensure directory exists
            string? directory = Path.GetDirectoryName(fullPath);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            // Write file
            File.WriteAllText(fullPath, file.Content, Encoding.UTF8);
            Console.WriteLine($"  Created: {file.FileName}");
        }
    }
}

class FileDefinition
{
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}
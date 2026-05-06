using System.Text;
using System.Text.RegularExpressions;

namespace FileExtractor;

class Program
{
    // Supported file extensions
    private static readonly Dictionary<string, string> ExtensionMap = new()
    {
        { "json", ".json" },
        { "typescript", ".ts" },
        { "scss", ".scss" },
        { "html", ".html" },
        { "css", ".css" },
        { "js", ".js" },
        { "ts", ".ts" }
    };

    static void Main(string[] args)
    {
        string baseDir = AppDomain.CurrentDomain.BaseDirectory.Split("bin")[0];

        string inputFile = Path.Combine(baseDir, "input.txt");
        string outputDir = Path.Combine(  baseDir , "output");

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
        // We need at least 2 lines: filename and file type
        if (startIndex + 1 >= lines.Length) return null;

        string? fileName = null;
        string? fileType = null;
        string[]? contentLines = null;

        // Try to find filename and type
        for (int attempt = 0; attempt < 3 && startIndex + attempt < lines.Length; attempt++)
        {
            var potentialName = lines[startIndex + attempt].Trim();

            // Check if this looks like a filename (contains path separators or extension)
            if (IsLikelyFileName(potentialName))
            {
                fileName = potentialName;

                // Look for file type on next line
                if (startIndex + attempt + 1 < lines.Length)
                {
                    var potentialType = lines[startIndex + attempt + 1].Trim().ToLower();
                    if (ExtensionMap.ContainsKey(potentialType))
                    {
                        fileType = potentialType;

                        // Found both, now extract content
                        int contentStart = startIndex + attempt + 2;
                        contentLines = ExtractContent(lines, contentStart);

                        startIndex = contentStart + contentLines.Length;
                        while (startIndex < lines.Length && string.IsNullOrWhiteSpace(lines[startIndex]))
                            startIndex++;

                        break;
                    }
                }
            }
        }

        if (fileName == null || fileType == null) return null;

        return new FileDefinition
        {
            FileName = fileName,
            FileType = fileType,
            Content = string.Join(Environment.NewLine, contentLines ?? Array.Empty<string>())
        };
    }

    static bool IsLikelyFileName(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return false;
        if (text.Length > 200) return false;

        // Skip if it looks like UI text
        if (text.Contains("Collapse") || text.Contains("ذخیره") || text.Contains("کپی"))
            return false;

        // Skip if it's just a number
        if (int.TryParse(text, out _)) return false;

        // Check for common file patterns
        bool hasExtension = Regex.IsMatch(text, @"\.(json|ts|tsx|js|jsx|scss|css|html|html)$", RegexOptions.IgnoreCase);
        bool hasPathSeparator = text.Contains('/') || text.Contains('\\');
        bool looksLikeComponent = Regex.IsMatch(text, @"^[a-zA-Z][a-zA-Z0-9\-/]*\.(ts|component|service|model|module)\.[a-z]+$");

        return hasExtension || hasPathSeparator || looksLikeComponent;
    }

    static string[] ExtractContent(string[] lines, int startIndex)
    {
        var content = new List<string>();

        for (int i = startIndex; i < lines.Length; i++)
        {
            string line = lines[i];

            // Stop at empty lines that are followed by another file block
            if (string.IsNullOrWhiteSpace(line))
            {
                // Check if next non-empty line looks like a new file
                int nextNonEmpty = i + 1;
                while (nextNonEmpty < lines.Length && string.IsNullOrWhiteSpace(lines[nextNonEmpty]))
                    nextNonEmpty++;

                if (nextNonEmpty < lines.Length && IsLikelyFileName(lines[nextNonEmpty].Trim()))
                    break;

                content.Add(line);
                continue;
            }

            // Skip metadata lines
            if (line.Trim() == "Collapse" ||
                line.Trim() == "ذخیره" ||
                line.Trim() == "کپی" ||
                line.Trim() == "Copy" ||
                line.Trim() == "Save")
            {
                continue;
            }

            // Skip line numbers (single number or range like "1", "2", "125", "126")
            string trimmed = line.Trim();
            if (Regex.IsMatch(trimmed, @"^\d+$"))
                continue;

            // Skip multiple consecutive line numbers (like "⌄" markers)
            if (trimmed == "⌄" || trimmed == "v" || trimmed == "^")
                continue;

            // Remove leading line numbers from content
            // Pattern: number followed by space or at start, then content
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
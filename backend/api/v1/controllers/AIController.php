<?php
// backend/api/v1/controllers/AIController.php

require_once __DIR__ . '/../config/Database.php';

class AIController {
    
    // Simulate an AI Streaming response using Server-Sent Events (SSE)
    public static function streamGeneration() {
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');

        // Allow CORS for SSE
        header("Access-Control-Allow-Origin: *");

        $input = json_decode(file_get_contents('php://input'), true);
        $prompt = $input['prompt'] ?? 'Write a paragraph about AI.';
        
        // In a real production environment, you would use curl/Guzzle to 
        // stream the response from OpenAI/Anthropic APIs here.
        // For demonstration of the SSE architecture, we simulate typing:
        
        $simulatedResponse = "This is a real-time AI generated response simulating a streaming connection from an LLM. It can generate outlines, SEO metadata, or rewrite content based on the prompt: '" . $prompt . "'. By using Server-Sent Events, the Block Editor feels incredibly fast and responsive, just like Notion AI.";
        
        $words = explode(' ', $simulatedResponse);
        
        foreach ($words as $word) {
            // Send chunk
            echo "data: " . json_encode(['chunk' => $word . " "]) . "\n\n";
            ob_flush();
            flush();
            usleep(50000); // 50ms delay per word to simulate streaming
        }

        // Send completion event
        echo "data: [DONE]\n\n";
        ob_flush();
        flush();
    }

    // Real-time analysis for Readability and Keyword Density
    public static function analyzeContent() {
        header("Content-Type: application/json");
        $input = json_decode(file_get_contents('php://input'), true);
        
        $content = $input['content'] ?? '';
        $focusKeyword = $input['focus_keyword'] ?? '';

        if (empty($content)) {
            echo json_encode(['seo_score' => 0, 'readability_score' => 0, 'suggestions' => []]);
            return;
        }

        // 1. Calculate Readability Score (Flesch Kincaid Approximation)
        $wordCount = str_word_count($content);
        $sentences = preg_split('/[.?!]/', $content, -1, PREG_SPLIT_NO_EMPTY);
        $sentenceCount = max(1, count($sentences));
        $syllableCount = max(1, $wordCount * 1.5); // Rough approximation
        
        $readability = 206.835 - 1.015 * ($wordCount / $sentenceCount) - 84.6 * ($syllableCount / $wordCount);
        $readabilityScore = max(0, min(100, (int)$readability));

        // 2. Calculate SEO Score & Density
        $seoScore = 50; // Base score
        $density = 0;
        $suggestions = [];

        if (!empty($focusKeyword)) {
            $keywordCount = substr_count(strtolower($content), strtolower($focusKeyword));
            $density = $wordCount > 0 ? ($keywordCount / $wordCount) * 100 : 0;
            
            if ($density > 0.5 && $density <= 2.5) {
                $seoScore += 30; // Optimal density
                $suggestions[] = "Optimal keyword density achieved.";
            } elseif ($density > 2.5) {
                $seoScore -= 20; // Keyword stuffing
                $suggestions[] = "Warning: Keyword stuffing detected. Density is too high.";
            } else {
                $seoScore -= 10;
                $suggestions[] = "Increase the frequency of your focus keyword.";
            }
        } else {
            $suggestions[] = "Please add a focus keyword to get a better SEO score.";
        }

        if ($wordCount > 300) $seoScore += 10;
        if ($wordCount > 800) $seoScore += 10;

        echo json_encode([
            'success' => true,
            'stats' => [
                'word_count' => $wordCount,
                'readability_score' => $readabilityScore,
                'seo_score' => max(0, min(100, $seoScore)),
                'keyword_density' => round($density, 2)
            ],
            'suggestions' => $suggestions
        ]);
    }
}
?>

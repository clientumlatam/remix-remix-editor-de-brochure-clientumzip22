<?php
namespace WPRaiz\ContentAPI\MCP;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * MCP Prompts — pre-configured workflow templates for AI agents.
 */
class MCP_Prompts {

    /**
     * Get prompt definitions.
     */
    public static function get_definitions(): array {
        return [
            [
                'name'        => 'publish_seo_article',
                'description' => 'Generate and publish an SEO-optimized article on a topic. Handles content generation, SEO metadata, category assignment, and publishing.',
                'arguments'   => [
                    [ 'name' => 'topic', 'description' => 'The article topic or briefing', 'required' => true ],
                    [ 'name' => 'language', 'description' => 'Content language (default: pt-BR)', 'required' => false ],
                    [ 'name' => 'category', 'description' => 'Category name for the post', 'required' => false ],
                ],
            ],
            [
                'name'        => 'content_series',
                'description' => 'Generate a series of related articles on a theme. Creates multiple posts as drafts for review.',
                'arguments'   => [
                    [ 'name' => 'theme', 'description' => 'The overarching theme or topic area', 'required' => true ],
                    [ 'name' => 'count', 'description' => 'Number of articles to generate (default: 5)', 'required' => false ],
                    [ 'name' => 'language', 'description' => 'Content language (default: pt-BR)', 'required' => false ],
                ],
            ],
            [
                'name'        => 'seo_audit',
                'description' => 'Audit recent posts for SEO issues. Checks for missing meta titles, descriptions, short content, missing images, and suggests improvements.',
                'arguments'   => [
                    [ 'name' => 'limit', 'description' => 'Number of recent posts to audit (default: 10)', 'required' => false ],
                ],
            ],
            [
                'name'        => 'refresh_old_content',
                'description' => 'Find and rewrite the oldest posts to refresh them with updated information and improved SEO.',
                'arguments'   => [
                    [ 'name' => 'count', 'description' => 'Number of old posts to refresh (default: 5)', 'required' => false ],
                    [ 'name' => 'action', 'description' => 'Rewrite action: improve_seo, expand, fix_grammar (default: improve_seo)', 'required' => false ],
                ],
            ],
            [
                'name'        => 'internal_linking',
                'description' => 'Analyze a post and suggest internal links to other related content on the site.',
                'arguments'   => [
                    [ 'name' => 'post_id', 'description' => 'ID of the post to analyze', 'required' => true ],
                ],
            ],
        ];
    }

    /**
     * Get a prompt's messages by name.
     */
    public static function get( string $name, array $arguments ): array {
        return match ( $name ) {
            'publish_seo_article' => self::prompt_publish_article( $arguments ),
            'content_series'      => self::prompt_content_series( $arguments ),
            'seo_audit'           => self::prompt_seo_audit( $arguments ),
            'refresh_old_content' => self::prompt_refresh_content( $arguments ),
            'internal_linking'    => self::prompt_internal_linking( $arguments ),
            default               => [ 'messages' => [ [ 'role' => 'user', 'content' => [ 'type' => 'text', 'text' => "Unknown prompt: {$name}" ] ] ] ],
        };
    }

    private static function prompt_publish_article( array $args ): array {
        $topic    = $args['topic'] ?? 'a trending topic';
        $language = $args['language'] ?? 'pt-BR';
        $category = $args['category'] ?? '';

        $cat_instruction = $category ? "Assign it to the '{$category}' category." : "Choose an appropriate existing category from the site.";

        return [ 'messages' => [
            [
                'role'    => 'user',
                'content' => [
                    'type' => 'text',
                    'text' => "Please write and publish an SEO-optimized article about: {$topic}\n\n"
                            . "Steps:\n"
                            . "1. First, read the site info and recent posts to understand the site's context and style\n"
                            . "2. Check existing categories to find the best fit\n"
                            . "3. Search for similar posts to avoid duplicate content and find internal linking opportunities\n"
                            . "4. Generate the article content in {$language} using the generate_content tool with auto_publish=true\n"
                            . "5. {$cat_instruction}\n"
                            . "6. Report the published URL and a brief summary of what was created",
                ],
            ],
        ]];
    }

    private static function prompt_content_series( array $args ): array {
        $theme    = $args['theme'] ?? 'a trending topic';
        $count    = (int) ( $args['count'] ?? 5 );
        $language = $args['language'] ?? 'pt-BR';

        return [ 'messages' => [
            [
                'role'    => 'user',
                'content' => [
                    'type' => 'text',
                    'text' => "Create a series of {$count} related articles about: {$theme}\n\n"
                            . "Steps:\n"
                            . "1. Read site info and recent posts for context\n"
                            . "2. Plan {$count} article titles that cover different aspects of the theme\n"
                            . "3. For each article, use generate_content to create it as a draft (auto_publish=false)\n"
                            . "4. Language: {$language}\n"
                            . "5. Report all created drafts with their titles and edit URLs",
                ],
            ],
        ]];
    }

    private static function prompt_seo_audit( array $args ): array {
        $limit = (int) ( $args['limit'] ?? 10 );

        return [ 'messages' => [
            [
                'role'    => 'user',
                'content' => [
                    'type' => 'text',
                    'text' => "Perform an SEO audit on the {$limit} most recent posts.\n\n"
                            . "Steps:\n"
                            . "1. Read recent posts from the site\n"
                            . "2. For each post, check:\n"
                            . "   - Has SEO title? Is it under 60 chars?\n"
                            . "   - Has meta description? Is it under 155 chars?\n"
                            . "   - Has featured image?\n"
                            . "   - Content length (flag if under 300 words)\n"
                            . "   - Has proper headings (h2, h3)?\n"
                            . "3. Score each post (0-100)\n"
                            . "4. Provide specific improvement suggestions\n"
                            . "5. Offer to auto-fix issues using the rewrite tool",
                ],
            ],
        ]];
    }

    private static function prompt_refresh_content( array $args ): array {
        $count  = (int) ( $args['count'] ?? 5 );
        $action = $args['action'] ?? 'improve_seo';

        return [ 'messages' => [
            [
                'role'    => 'user',
                'content' => [
                    'type' => 'text',
                    'text' => "Refresh the {$count} oldest published posts on the site.\n\n"
                            . "Steps:\n"
                            . "1. Get content stats and identify the oldest posts\n"
                            . "2. For each post, use rewrite_post with action='{$action}' and save=false (preview first)\n"
                            . "3. Show me the before/after comparison for each\n"
                            . "4. Ask for confirmation before saving any changes",
                ],
            ],
        ]];
    }

    private static function prompt_internal_linking( array $args ): array {
        $post_id = (int) ( $args['post_id'] ?? 0 );

        return [ 'messages' => [
            [
                'role'    => 'user',
                'content' => [
                    'type' => 'text',
                    'text' => "Analyze post #{$post_id} and suggest internal links.\n\n"
                            . "Steps:\n"
                            . "1. Read the post content\n"
                            . "2. Use search_similar to find related posts\n"
                            . "3. For each related post with score > 30, suggest where in the content to add a link\n"
                            . "4. Provide the suggested anchor text and target URL\n"
                            . "5. Offer to update the post with the suggested links",
                ],
            ],
        ]];
    }
}

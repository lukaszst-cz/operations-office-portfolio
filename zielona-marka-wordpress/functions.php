<?php
if (!defined('ABSPATH')) { exit; }

define('ZM_VERSION', '1.0.0');

function zm_setup(): void {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script']);
    add_theme_support('responsive-embeds');
    add_theme_support('align-wide');
    add_image_size('zm-project', 1200, 820, true);
    register_nav_menus(['primary' => __('Menu główne', 'zielona-marka')]);
}
add_action('after_setup_theme', 'zm_setup');

function zm_assets(): void {
    wp_enqueue_style('zm-main', get_template_directory_uri() . '/assets/css/main.css', [], ZM_VERSION);
    wp_enqueue_script('zm-main', get_template_directory_uri() . '/assets/js/main.js', [], ZM_VERSION, true);
}
add_action('wp_enqueue_scripts', 'zm_assets');

function zm_register_project_type(): void {
    register_post_type('realizacja', [
        'labels' => [
            'name' => __('Realizacje', 'zielona-marka'),
            'singular_name' => __('Realizacja', 'zielona-marka'),
            'add_new_item' => __('Dodaj realizację', 'zielona-marka'),
            'edit_item' => __('Edytuj realizację', 'zielona-marka'),
        ],
        'public' => true,
        'menu_icon' => 'dashicons-layout',
        'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'],
        'has_archive' => true,
        'rewrite' => ['slug' => 'realizacje'],
        'show_in_rest' => true,
    ]);
}
add_action('init', 'zm_register_project_type');

function zm_project_meta_box(): void {
    add_meta_box('zm_project_details', __('Szczegóły realizacji', 'zielona-marka'), 'zm_project_meta_box_html', 'realizacja', 'side', 'default');
}
add_action('add_meta_boxes', 'zm_project_meta_box');

function zm_project_meta_box_html(WP_Post $post): void {
    wp_nonce_field('zm_save_project', 'zm_project_nonce');
    $client = get_post_meta($post->ID, 'klient', true);
    $scope = get_post_meta($post->ID, 'zakres', true);
    ?>
    <p><label for="zm-client"><strong><?php esc_html_e('Klient', 'zielona-marka'); ?></strong></label><br><input class="widefat" id="zm-client" name="zm_client" value="<?php echo esc_attr($client); ?>"></p>
    <p><label for="zm-scope"><strong><?php esc_html_e('Zakres', 'zielona-marka'); ?></strong></label><br><input class="widefat" id="zm-scope" name="zm_scope" value="<?php echo esc_attr($scope); ?>" placeholder="np. Projekt, WordPress, SEO"></p>
    <p><?php esc_html_e('Miniatura wpisu jest używana jako podgląd projektu w portfolio.', 'zielona-marka'); ?></p>
    <?php
}

function zm_save_project_meta(int $post_id): void {
    if (!isset($_POST['zm_project_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['zm_project_nonce'])), 'zm_save_project')) { return; }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) { return; }
    if (!current_user_can('edit_post', $post_id)) { return; }
    update_post_meta($post_id, 'klient', sanitize_text_field(wp_unslash($_POST['zm_client'] ?? '')));
    update_post_meta($post_id, 'zakres', sanitize_text_field(wp_unslash($_POST['zm_scope'] ?? '')));
}
add_action('save_post_realizacja', 'zm_save_project_meta');

function zm_customize_register(WP_Customize_Manager $customizer): void {
    $customizer->add_section('zm_contact', [
        'title' => __('Zielona Marka, kontakt', 'zielona-marka'),
        'priority' => 30,
    ]);
    $fields = [
        'zm_email' => ['E-mail', 'lukasz.staniewicz@gmail.com', 'email'],
        'zm_phone' => ['Telefon', '+48 000 000 000', 'text'],
        'zm_instagram' => ['Adres profilu Instagram', '', 'url'],
    ];
    foreach ($fields as $id => [$label, $default, $type]) {
        $customizer->add_setting($id, ['default' => $default, 'sanitize_callback' => $type === 'email' ? 'sanitize_email' : ($type === 'url' ? 'esc_url_raw' : 'sanitize_text_field')]);
        $customizer->add_control($id, ['label' => __($label, 'zielona-marka'), 'section' => 'zm_contact', 'type' => $type]);
    }
}
add_action('customize_register', 'zm_customize_register');

function zm_handle_brief(): void {
    if (!isset($_POST['zm_brief_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['zm_brief_nonce'])), 'zm_send_brief')) {
        wp_safe_redirect(add_query_arg('brief', 'error', wp_get_referer() ?: home_url('/')) . '#kontakt');
        exit;
    }

    $name = sanitize_text_field(wp_unslash($_POST['name'] ?? ''));
    $email = sanitize_email(wp_unslash($_POST['email'] ?? ''));
    $company = sanitize_text_field(wp_unslash($_POST['company'] ?? ''));
    $budget = sanitize_text_field(wp_unslash($_POST['budget'] ?? ''));
    $message = sanitize_textarea_field(wp_unslash($_POST['message'] ?? ''));

    if (!$name || !is_email($email) || !$message) {
        wp_safe_redirect(add_query_arg('brief', 'error', wp_get_referer() ?: home_url('/')) . '#kontakt');
        exit;
    }

    $recipient = get_theme_mod('zm_email', get_option('admin_email'));
    $subject = sprintf(__('Nowy brief: %s', 'zielona-marka'), $company ?: $name);
    $body = "Imię: {$name}\nE-mail: {$email}\nFirma: {$company}\nBudżet: {$budget}\n\nOpis projektu:\n{$message}";
    $sent = wp_mail($recipient, $subject, $body, ['Reply-To: ' . $name . ' <' . $email . '>']);
    wp_safe_redirect(add_query_arg('brief', $sent ? 'sent' : 'error', wp_get_referer() ?: home_url('/')) . '#kontakt');
    exit;
}
add_action('admin_post_nopriv_zm_send_brief', 'zm_handle_brief');
add_action('admin_post_zm_send_brief', 'zm_handle_brief');

function zm_schema(): void {
    if (!is_front_page()) { return; }
    $schema = [
        '@context' => 'https://schema.org',
        '@type' => 'ProfessionalService',
        'name' => 'Zielona Marka',
        'url' => home_url('/'),
        'email' => get_theme_mod('zm_email', 'lukasz.staniewicz@gmail.com'),
        'areaServed' => 'PL',
        'description' => 'Projektowanie i wdrażanie stron internetowych dla firm.',
        'serviceType' => ['Strony firmowe', 'Landing page', 'Portfolio', 'WordPress', 'SEO techniczne'],
    ];
    echo '<script type="application/ld+json">' . wp_json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
}
add_action('wp_head', 'zm_schema', 30);

function zm_excerpt_length(): int { return 22; }
add_filter('excerpt_length', 'zm_excerpt_length');

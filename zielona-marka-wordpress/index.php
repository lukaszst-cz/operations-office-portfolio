<?php get_header(); ?>
<main id="main" class="content-page wrap">
    <header class="page-heading"><span class="kicker">ZIELONA MARKA / BLOG</span><h1><?php single_post_title(); ?></h1></header>
    <div class="posts-grid">
        <?php if (have_posts()) : while (have_posts()) : the_post(); ?>
            <article <?php post_class('post-card'); ?>><span class="micro"><?php echo esc_html(get_the_date()); ?></span><h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2><p><?php echo esc_html(get_the_excerpt()); ?></p><a class="text-link" href="<?php the_permalink(); ?>">Czytaj dalej ↗</a></article>
        <?php endwhile; else : ?><p><?php esc_html_e('Brak treści do wyświetlenia.', 'zielona-marka'); ?></p><?php endif; ?>
    </div>
    <?php the_posts_pagination(); ?>
</main>
<?php get_footer(); ?>

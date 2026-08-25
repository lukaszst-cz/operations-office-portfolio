<?php get_header(); ?>
<main id="main" class="content-page wrap">
<?php while (have_posts()) : the_post(); ?>
    <article <?php post_class(); ?>><header class="page-heading"><span class="kicker"><?php echo esc_html(get_post_type_object(get_post_type())->labels->singular_name ?? 'ZIELONA MARKA'); ?></span><h1><?php the_title(); ?></h1><?php if (has_post_thumbnail()) : ?><div class="single-image"><?php the_post_thumbnail('full'); ?></div><?php endif; ?></header><div class="entry-content"><?php the_content(); ?></div></article>
<?php endwhile; ?>
</main>
<?php get_footer(); ?>

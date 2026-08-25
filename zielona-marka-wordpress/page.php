<?php get_header(); ?>
<main id="main" class="content-page wrap">
<?php while (have_posts()) : the_post(); ?>
    <article <?php post_class(); ?>><header class="page-heading"><span class="kicker">ZIELONA MARKA</span><h1><?php the_title(); ?></h1></header><div class="entry-content"><?php the_content(); ?></div></article>
<?php endwhile; ?>
</main>
<?php get_footer(); ?>

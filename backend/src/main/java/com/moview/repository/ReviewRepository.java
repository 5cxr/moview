package com.moview.repository;

import com.moview.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Integer> {

    /**
     * Join query demo from the design doc: username, title, rating, liked,
     * reviewText for every review of a given movie.
     */
    @Query("SELECT r FROM Review r JOIN FETCH r.user JOIN FETCH r.movie WHERE r.movie.movieId = :movieId")
    List<Review> findByMovieIdWithJoin(@Param("movieId") Integer movieId);

    @Query("SELECT r FROM Review r JOIN FETCH r.user JOIN FETCH r.movie WHERE r.user.userId = :userId")
    List<Review> findByUserUserId(@Param("userId") Integer userId);

    @Query("SELECT r FROM Review r JOIN FETCH r.user JOIN FETCH r.movie WHERE r.reviewId = :reviewId")
    Optional<Review> findByIdWithJoin(@Param("reviewId") Integer reviewId);

    Optional<Review> findByUserUserIdAndMovieMovieId(Integer userId, Integer movieId);

    boolean existsByUserUserIdAndMovieMovieId(Integer userId, Integer movieId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.movie.movieId = :movieId")
    Double findAverageRatingByMovieId(@Param("movieId") Integer movieId);

    long countByMovieMovieId(Integer movieId);
}

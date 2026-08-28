package com.moview.service;

import com.moview.dto.MovieRequest;
import com.moview.dto.MovieResponse;
import com.moview.exception.ResourceNotFoundException;
import com.moview.model.Movie;
import com.moview.repository.MovieRepository;
import com.moview.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovieService {

    private final MovieRepository movieRepository;
    private final ReviewRepository reviewRepository;

    public MovieService(MovieRepository movieRepository, ReviewRepository reviewRepository) {
        this.movieRepository = movieRepository;
        this.reviewRepository = reviewRepository;
    }

    public List<MovieResponse> getAll(String search) {
        List<Movie> movies = (search == null || search.isBlank())
                ? movieRepository.findAll()
                : movieRepository.findByTitleContainingIgnoreCase(search);

        return movies.stream().map(this::toResponseWithRating).toList();
    }

    public MovieResponse getById(Integer movieId) {
        return toResponseWithRating(findMovieOrThrow(movieId));
    }

    private MovieResponse toResponseWithRating(Movie movie) {
        Double avgRating = reviewRepository.findAverageRatingByMovieId(movie.getMovieId());
        long reviewCount = reviewRepository.countByMovieMovieId(movie.getMovieId());
        return new MovieResponse(movie, avgRating, reviewCount);
    }

    public MovieResponse create(MovieRequest request) {
        Movie movie = new Movie(request.getTitle(), request.getGenre(), request.getReleaseYear(), request.getDirector());
        movie.setPosterUrl(request.getPosterUrl());
        return new MovieResponse(movieRepository.save(movie));
    }

    public MovieResponse update(Integer movieId, MovieRequest request) {
        Movie movie = findMovieOrThrow(movieId);
        movie.setTitle(request.getTitle());
        movie.setGenre(request.getGenre());
        movie.setReleaseYear(request.getReleaseYear());
        movie.setDirector(request.getDirector());
        movie.setPosterUrl(request.getPosterUrl());
        return new MovieResponse(movieRepository.save(movie));
    }

    public void delete(Integer movieId) {
        Movie movie = findMovieOrThrow(movieId);
        movieRepository.delete(movie);
    }

    private Movie findMovieOrThrow(Integer movieId) {
        return movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("no movie with id: " + movieId));
    }
}

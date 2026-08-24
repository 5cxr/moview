package com.moview.controller;

import com.moview.dto.MovieRequest;
import com.moview.dto.MovieResponse;
import com.moview.service.MovieService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CRUD for the movie catalog. Reads are public; writes require a valid JWT
 * (see SecurityConfig).
 */
@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    /** Lists all movies, optionally filtered by a case-insensitive title match. */
    @GetMapping
    public ResponseEntity<List<MovieResponse>> getAll(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(movieService.getAll(search));
    }

    /** Fetches a single movie by id. */
    @GetMapping("/{movieId}")
    public ResponseEntity<MovieResponse> getById(@PathVariable Integer movieId) {
        return ResponseEntity.ok(movieService.getById(movieId));
    }

    /** Adds a movie to the catalog. */
    @PostMapping
    public ResponseEntity<MovieResponse> create(@Valid @RequestBody MovieRequest request) {
        return ResponseEntity.ok(movieService.create(request));
    }

    /** Updates an existing movie's details. */
    @PutMapping("/{movieId}")
    public ResponseEntity<MovieResponse> update(@PathVariable Integer movieId, @Valid @RequestBody MovieRequest request) {
        return ResponseEntity.ok(movieService.update(movieId, request));
    }

    /** Removes a movie from the catalog. */
    @DeleteMapping("/{movieId}")
    public ResponseEntity<Void> delete(@PathVariable Integer movieId) {
        movieService.delete(movieId);
        return ResponseEntity.noContent().build();
    }
}

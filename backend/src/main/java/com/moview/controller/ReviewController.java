package com.moview.controller;

import com.moview.dto.ReviewRequest;
import com.moview.dto.ReviewResponse;
import com.moview.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CRUD for reviews - the User/Movie join table. Reads are public, writes
 * require a JWT and are scoped to the authenticated user.
 */
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /** All reviews for one movie - the join-query demo from the design doc. */
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<ReviewResponse>> getByMovie(@PathVariable Integer movieId) {
        return ResponseEntity.ok(reviewService.getByMovie(movieId));
    }

    /** All reviews written by the logged-in user. */
    @GetMapping("/mine")
    public ResponseEntity<List<ReviewResponse>> getMine(Authentication authentication) {
        return ResponseEntity.ok(reviewService.getByCurrentUser(authentication.getName()));
    }

    /** Creates a review for a movie the current user hasn't reviewed yet. */
    @PostMapping
    public ResponseEntity<ReviewResponse> create(Authentication authentication, @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.create(authentication.getName(), request));
    }

    /** Updates one of the current user's own reviews. */
    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> update(Authentication authentication,
                                                  @PathVariable Integer reviewId,
                                                  @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.update(authentication.getName(), reviewId, request));
    }

    /** Deletes one of the current user's own reviews. */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable Integer reviewId) {
        reviewService.delete(authentication.getName(), reviewId);
        return ResponseEntity.noContent().build();
    }
}

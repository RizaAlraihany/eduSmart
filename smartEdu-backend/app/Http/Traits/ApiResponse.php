<?php

namespace App\Http\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

trait ApiResponse
{
    /**
     * Response sukses standar.
     */
    protected function successResponse(
        mixed $data = null,
        string $message = 'Berhasil',
        int $status = 200,
        ?array $meta = null
    ): JsonResponse {
        $payload = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $payload['data'] = $data;
        }

        if ($meta !== null) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status);
    }

    /**
     * Response sukses untuk paginated data.
     * Otomatis ekstrak items() dan bangun meta dari LengthAwarePaginator.
     *
     * @param array|null $extra  Field tambahan di root payload (misal: 'statistics')
     */
    protected function paginatedResponse(
        LengthAwarePaginator $paginator,
        string $message = 'Berhasil',
        ?array $extra = null
    ): JsonResponse {
        $payload = [
            'success' => true,
            'message' => $message,
            'data'    => $paginator->items(),
            'meta'    => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ];

        if ($extra !== null) {
            $payload = array_merge($payload, $extra);
        }

        return response()->json($payload, 200);
    }

    /**
     * Response error standar.
     */
    protected function errorResponse(
        string $message = 'Terjadi kesalahan',
        int $code = 500,
        ?array $errors = null
    ): JsonResponse {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $code);
    }

    /** 201 Created */
    protected function createdResponse(mixed $data, string $message = 'Data berhasil ditambahkan'): JsonResponse
    {
        return $this->successResponse($data, $message, 201);
    }

    /** 404 Not Found */
    protected function notFoundResponse(string $message = 'Data tidak ditemukan'): JsonResponse
    {
        return $this->errorResponse($message, 404);
    }

    /** 403 Forbidden */
    protected function forbiddenResponse(string $message = 'Akses ditolak'): JsonResponse
    {
        return $this->errorResponse($message, 403);
    }

    /** 422 Unprocessable — business rule violation */
    protected function unprocessableResponse(string $message, ?array $errors = null): JsonResponse
    {
        return $this->errorResponse($message, 422, $errors);
    }

    /** 500 Server Error */
    protected function serverErrorResponse(string $message = 'Terjadi kesalahan pada server. Silakan coba lagi.'): JsonResponse
    {
        return $this->errorResponse($message, 500);
    }
}

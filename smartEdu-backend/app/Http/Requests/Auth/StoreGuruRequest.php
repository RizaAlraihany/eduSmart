<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGuruRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Route sudah diproteksi middleware role:admin
        return true;
    }

    public function rules(): array
    {
        return [
            'nama'                => ['required', 'string', 'max:255'],
            'email'               => ['required', 'email', 'unique:users,email'],
            'nip'                 => ['required', 'string', 'unique:gurus,nip'],
            'jenis_kelamin'       => ['required', 'in:L,P'],
            'tanggal_lahir'       => ['nullable', 'date'],
            'telepon'             => ['nullable', 'string', 'max:20'],
            'alamat'              => ['nullable', 'string'],
            'pendidikan_terakhir' => ['nullable', 'string', 'max:10'],
            'status'              => ['nullable', 'in:aktif,nonaktif'],
            'password'            => ['required', 'string', 'min:8'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Email ini sudah digunakan oleh akun lain.',
            'nip.unique'   => 'NIP ini sudah terdaftar.',
        ];
    }
}

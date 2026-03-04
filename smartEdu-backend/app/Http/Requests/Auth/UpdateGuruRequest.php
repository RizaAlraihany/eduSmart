<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGuruRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Ambil model Guru dari route binding — aman karena apiResource inject otomatis
        $guru = $this->route('guru');

        return [
            'nama'                => ['required', 'string', 'max:255'],
            'email'               => ['required', 'email', Rule::unique('users', 'email')->ignore($guru->user_id)],
            'nip'                 => ['required', 'string', Rule::unique('gurus', 'nip')->ignore($guru->id)],
            'jenis_kelamin'       => ['required', 'in:L,P'],
            'tanggal_lahir'       => ['nullable', 'date'],
            'telepon'             => ['nullable', 'string', 'max:20'],
            'alamat'              => ['nullable', 'string'],
            'pendidikan_terakhir' => ['nullable', 'string', 'max:10'],
            'status'              => ['required', 'in:aktif,nonaktif'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Email ini sudah digunakan oleh akun lain.',
            'nip.unique'   => 'NIP ini sudah digunakan oleh guru lain.',
        ];
    }
}

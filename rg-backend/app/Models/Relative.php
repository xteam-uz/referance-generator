<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Relative extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'qarindoshligi',
        'fio',
        'tugilgan',
        'vafot_etgan',
        'ish_joyi',
        'turar_joyi',
        'vafot_etgan_yili',
        'kasbi',
        'order_index',
    ];

    protected $casts = [
        'vafot_etgan' => 'boolean',
        'order_index' => 'integer',
    ];

    /**
     * Get the document that owns the relative.
     * @return Illuminate\Database\Eloquent\Relations\BelongsTo;
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}

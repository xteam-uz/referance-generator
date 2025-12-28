<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('personal_information', function (Blueprint $table) {
            $table->string('partiyaviyligi')->nullable()->after('millati');
            $table->string('malumoti_boyicha_mutaxassisligi')->nullable()->after('malumoti');
            $table->string('qaysi_chet_tillarini_biladi')->nullable()->after('malumoti_boyicha_mutaxassisligi');
            $table->text('xalq_deputatlari')->nullable()->after('qaysi_chet_tillarini_biladi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('personal_information', function (Blueprint $table) {
            $table->dropColumn([
                'partiyaviyligi',
                'malumoti_boyicha_mutaxassisligi',
                'qaysi_chet_tillarini_biladi',
                'xalq_deputatlari',
            ]);
        });
    }
};

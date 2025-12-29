<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('education_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->onDelete('cascade');
            $table->string('malumoti');  // Education level: Oliy, O'rta maxsus, O'rta
            $table->text('tamomlagan')->nullable();  //  1997 yil
            $table->string('mutaxassisligi')->nullable();  // falsafa
            $table->string('ilmiy_daraja')->nullable();  // falsafa fanlari nomzodi (2003)
            $table->string('ilmiy_unvoni')->nullable();  // dotsent (2005)
            $table->string('chet_tillari')->nullable();  // ingliz, rus, o'zbek
            $table->string('maxsus_unvoni')->nullable();  // maxsus unvoni
            $table->string('davlat_mukofoti')->nullable();  // Mustaqillik ordeni (2011)
            $table->integer('order_index')->default(0);  // To maintain order of entries
            $table->timestamps();

            $table->index(['document_id', 'order_index']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('education_records');
    }
};

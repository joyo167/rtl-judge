import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.problem.upsert({
    where: { slug: 'full-adder' },
    update: {},
    create: {
      id: 'prob_001',
      title: 'Full Adder',
      slug: 'full-adder',
      difficulty: 'Easy',
      points: 100,
      tags: ['combinational', 'arithmetic'],
      description: `Implement a 1-bit full adder in Verilog.

Given two single-bit inputs \`a\` and \`b\`, and a carry-in bit \`cin\`, compute the sum and carry-out.

- sum  = a XOR b XOR cin
- cout = (a AND b) OR (b AND cin) OR (a AND cin)`,
      starterCode: `module full_adder (
    input  wire a,
    input  wire b,
    input  wire cin,
    output wire sum,
    output wire cout
);
    // Your implementation here

endmodule`,
      testbenchCode: `\`timescale 1ns/1ps

module full_adder_tb;
    reg a, b, cin;
    wire sum, cout;

    full_adder uut (
        .a(a), .b(b), .cin(cin),
        .sum(sum), .cout(cout)
    );

    integer errors = 0;

    task check;
        input exp_sum, exp_cout;
        begin
            #10;
            if (sum !== exp_sum || cout !== exp_cout) begin
                $display("FAIL: a=%b b=%b cin=%b => sum=%b cout=%b (expected sum=%b cout=%b)",
                         a, b, cin, sum, cout, exp_sum, exp_cout);
                errors = errors + 1;
            end
        end
    endtask

    initial begin
        // All 8 input combinations
        {a, b, cin} = 3'b000; check(0, 0);
        {a, b, cin} = 3'b001; check(1, 0);
        {a, b, cin} = 3'b010; check(1, 0);
        {a, b, cin} = 3'b011; check(0, 1);
        {a, b, cin} = 3'b100; check(1, 0);
        {a, b, cin} = 3'b101; check(0, 1);
        {a, b, cin} = 3'b110; check(0, 1);
        {a, b, cin} = 3'b111; check(1, 1);

        if (errors == 0)
            $display("ALL TESTS PASSED");
        else
            $display("%0d TEST(S) FAILED", errors);

        $finish;
    end
endmodule`,
    },
  })

  await prisma.problem.upsert({
    where: { slug: 'four-bit-counter' },
    update: {},
    create: {
      id: 'prob_002',
      title: '4-Bit Counter',
      slug: 'four-bit-counter',
      difficulty: 'Medium',
      points: 150,
      tags: ['sequential', 'counter'],
      description: `Implement a synchronous 4-bit up-counter in Verilog.

On each rising edge of \`clk\`, the counter increments by 1. When \`rst\` is high (synchronous reset), the counter resets to 0.

- count increments from 0 to 15, then wraps back to 0
- reset is synchronous (only takes effect on rising clock edge)`,
      starterCode: `module counter_4bit (
    input  wire clk,
    input  wire rst,
    output reg  [3:0] count
);
    // Your implementation here

endmodule`,
      testbenchCode: `\`timescale 1ns/1ps

module counter_4bit_tb;
    reg clk, rst;
    wire [3:0] count;

    counter_4bit uut (.clk(clk), .rst(rst), .count(count));

    always #5 clk = ~clk;

    integer errors = 0;
    integer i;

    initial begin
        clk = 0; rst = 1;
        @(posedge clk); #1;
        if (count !== 4'd0) begin
            $display("FAIL: reset did not zero counter, got %0d", count);
            errors = errors + 1;
        end
        rst = 0;
        for (i = 1; i <= 16; i = i + 1) begin
            @(posedge clk); #1;
            if (count !== i % 16) begin
                $display("FAIL: expected %0d got %0d", i % 16, count);
                errors = errors + 1;
            end
        end
        if (errors == 0) $display("ALL TESTS PASSED");
        else $display("%0d TEST(S) FAILED", errors);
        $finish;
    end
endmodule`,
    },
  })

  await prisma.problem.upsert({
    where: { slug: 'barrel-shifter' },
    update: {},
    create: {
      id: 'prob_003',
      title: 'Barrel Shifter',
      slug: 'barrel-shifter',
      difficulty: 'Hard',
      points: 200,
      tags: ['combinational', 'shift'],
      description: `Implement an 8-bit barrel shifter in Verilog.

Given an 8-bit input \`data\` and a 3-bit shift amount \`shamt\`, output \`data\` logically left-shifted by \`shamt\` positions. Bits shifted out are lost; vacated positions are filled with 0.`,
      starterCode: `module barrel_shifter (
    input  wire [7:0] data,
    input  wire [2:0] shamt,
    output wire [7:0] out
);
    // Your implementation here

endmodule`,
      testbenchCode: `\`timescale 1ns/1ps

module barrel_shifter_tb;
    reg  [7:0] data;
    reg  [2:0] shamt;
    wire [7:0] out;

    barrel_shifter uut (.data(data), .shamt(shamt), .out(out));

    integer errors = 0;

    task check;
        input [7:0] exp;
        begin
            #10;
            if (out !== exp) begin
                $display("FAIL: data=%b shamt=%0d => out=%b (expected %b)",
                         data, shamt, out, exp);
                errors = errors + 1;
            end
        end
    endtask

    initial begin
        data = 8'b00000001; shamt = 3'd0; check(8'b00000001);
        data = 8'b00000001; shamt = 3'd1; check(8'b00000010);
        data = 8'b00000001; shamt = 3'd4; check(8'b00010000);
        data = 8'b00000001; shamt = 3'd7; check(8'b10000000);
        data = 8'b10000001; shamt = 3'd1; check(8'b00000010);
        data = 8'b11111111; shamt = 3'd4; check(8'b11110000);
        data = 8'b10101010; shamt = 3'd2; check(8'b10101000);
        if (errors == 0) $display("ALL TESTS PASSED");
        else $display("%0d TEST(S) FAILED", errors);
        $finish;
    end
endmodule`,
    },
  })

  console.log('✓ Seeded 3 problems')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

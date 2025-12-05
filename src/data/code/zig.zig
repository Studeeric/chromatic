// @ts-nocheck
const std = @import("std");

const ColorScheme = struct {
    background: []const u8,
    foreground: []const u8,
    red: []const u8,

    pub fn toMap(self: ColorScheme, allocator: std.mem.Allocator) !std.StringHashMap([]const u8) {
        var map = std.StringHashMap([]const u8).init(allocator);
        try map.put("background", self.background);
        try map.put("foreground", self.foreground);
        return map;
    }
};

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    const allocator = gpa.allocator();
    const scheme = ColorScheme{
        .background = "#0c0c0c",
        .foreground = "#cccccc",
    };
    const map = try scheme.toMap(allocator);
    std.debug.print("Background: {s}\n", .{scheme.background});

// @ts-nocheck
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    char* background;
    char* foreground;
    char* red;
} ColorScheme;

ColorScheme* create_color_scheme(const char* bg, const char* fg) {
    ColorScheme* scheme = malloc(sizeof(ColorScheme));
    scheme->background = strdup(bg);
    scheme->foreground = strdup(fg);
    return scheme;
}

int main(void) {
    ColorScheme* scheme = create_color_scheme("#0c0c0c", "#cccccc");
    printf("Background: %s\n", scheme->background);
    free(scheme->background);
    free(scheme);
    return 0;
}

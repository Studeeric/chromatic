// @ts-nocheck
#include <iostream>
#include <string>
#include <map>

class ColorScheme {
private:
    std::string background;
    std::string foreground;

public:
    ColorScheme(const std::string& bg, const std::string& fg)
        : background(bg), foreground(fg) {}

    std::map<std::string, std::string> to_map() const {
        std::map<std::string, std::string> result;
        result["background"] = background;
        result["foreground"] = foreground;
        return result;
    }
};

int main() {
    ColorScheme scheme("#0c0c0c", "#cccccc");
    std::cout << "Background: " << scheme.to_map()["background"] << std::endl;
    return 0;
}

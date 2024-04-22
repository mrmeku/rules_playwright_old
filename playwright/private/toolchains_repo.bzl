"""Create a repository to hold the toolchains

This follows guidance here:
https://docs.bazel.build/versions/main/skylark/deploying.html#registering-toolchains
"
Note that in order to resolve toolchains in the analysis phase
Bazel needs to analyze all toolchain targets that are registered.
Bazel will not need to analyze all targets referenced by toolchain.toolchain attribute.
If in order to register toolchains you need to perform complex computation in the repository,
consider splitting the repository with toolchain targets
from the repository with <LANG>_toolchain targets.
Former will be always fetched,
and the latter will only be fetched when user actually needs to build <LANG> code.
"
The "complex computation" in our case is simply downloading large artifacts.
This guidance tells us how to avoid that: we put the toolchain targets in the alias repository
with only the toolchain attribute pointing into the platform-specific repositories.
"""

# Add more platforms as needed to mirror all the binaries
# published by the upstream project.
PLATFORMS = {
    "unknown-linux-x64": struct(
        compatible_with = [
            "@platforms//cpu:x86_64",
            "@platforms//os:linux",
        ],
    ),
    "unknown-linux-arm64": struct(
        compatible_with = [
            "@platforms//cpu:arm64",
            "@platforms//os:linux",
        ],
    ),
    "ubuntu18.04-x64": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:ubuntu18.04",
            "@platforms//cpu:x86_64",
            "@platforms//os:linux",
        ],
    ),
    "ubuntu20.04-x64": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:ubuntu20.04",
            "@platforms//cpu:x86_64",
            "@platforms//os:linux",
        ],
    ),
    "ubuntu22.04-x64": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:ubuntu22.04",
            "@platforms//cpu:x86_64",
            "@platforms//os:linux",
        ],
    ),
    "ubuntu18.04-arm64": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:ubuntu18.04",
            "@platforms//cpu:arm64",
            "@platforms//os:linux",
        ],
    ),
    "ubuntu20.04-arm64": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:ubuntu20.04",
            "@platforms//cpu:arm64",
            "@platforms//os:linux",
        ],
    ),
    "ubuntu22.04-arm64": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:ubuntu22.04",
            "@platforms//cpu:arm64",
            "@platforms//os:linux",
        ],
    ),
    "debian11-x64": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:debian11",
            "@platforms//cpu:x86_64",
            "@platforms//os:linux",
        ],
    ),
    "debian11-arm64": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:debian11",
            "@platforms//cpu:arm64",
            "@platforms//os:linux",
        ],
    ),
    "debian12-x64": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:debian12",
            "@platforms//cpu:x86_64",
            "@platforms//os:linux",
        ],
    ),
    "debian12-arm64": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:debian12",
            "@platforms//cpu:arm64",
            "@platforms//os:linux",
        ],
    ),
    "mac10.13": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:mac10.13",
            "@platforms//cpu:x86_64",
            "@platforms//os:macos",
        ],
    ),
    "mac10.14": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:mac10.14",
            "@platforms//cpu:x86_64",
            "@platforms//os:macos",
        ],
    ),
    "mac10.15": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:mac10.15",
            "@platforms//cpu:x86_64",
            "@platforms//os:macos",
        ],
    ),
    "mac11": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:mac11",
            "@platforms//cpu:x86_64",
            "@platforms//os:macos",
        ],
    ),
    "mac11-arm64": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:mac11",
            "@platforms//cpu:arm64",
            "@platforms//os:macos",
        ],
    ),
    "mac12": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:mac12",
            "@platforms//cpu:x86_64",
            "@platforms//os:macos",
        ],
    ),
    "mac12-arm64": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:mac12",
            "@platforms//cpu:arm64",
            "@platforms//os:macos",
        ],
    ),
    "mac13": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:mac13",
            "@platforms//cpu:x86_64",
            "@platforms//os:macos",
        ],
    ),
    "mac13-arm64": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:mac13",
            "@platforms//cpu:arm64",
            "@platforms//os:macos",
        ],
    ),
    "mac14": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:mac14",
            "@platforms//cpu:x86_64",
            "@platforms//os:macos",
        ],
    ),
    "mac14-arm64": struct(
        compatible_with = [
            "@mrmeku_rules_playwright//playwright:mac14",
            "@platforms//cpu:arm64",
            "@platforms//os:macos",
        ],
    ),
    "mac-unkown": struct(
        compatible_with = [
            "@platforms//cpu:x86_64",
            "@platforms//os:macos",
        ],
    ),
    "mac-unkown-arm64": struct(
        compatible_with = [
            "@platforms//cpu:arm64",
            "@platforms//os:macos",
        ],
    ),
    "win64": struct(
        compatible_with = [
            "@platforms//cpu:x86_64",
            "@platforms//os:windows",
        ],
    ),
}

def _toolchains_repo_impl(repository_ctx):
    build_content = """# Generated by toolchains_repo.bzl
#
# These can be registered in the workspace file or passed to --extra_toolchains flag.
# By default all these toolchains are registered by the playwright_register_toolchains macro
# so you don't normally need to interact with these targets.

"""

    for [platform, meta] in PLATFORMS.items():
        build_content += """
# Declare a toolchain Bazel will select for running the tool in an action
# on the execution platform.
toolchain(
    name = "{platform}_toolchain",
    exec_compatible_with = {compatible_with},
    toolchain = "@{user_repository_name}_{platform}//:playwright_toolchain",
    toolchain_type = "@mrmeku_rules_playwright//playwright:toolchain_type",
)
""".format(
            platform = platform,
            user_repository_name = repository_ctx.attr.user_repository_name,
            compatible_with = meta.compatible_with,
        )

    # Base BUILD file for this repository
    repository_ctx.file("BUILD.bazel", build_content)

toolchains_repo = repository_rule(
    _toolchains_repo_impl,
    doc = """Creates a repository with toolchain definitions for all known platforms
     which can be registered or selected.""",
    attrs = {
        "user_repository_name": attr.string(doc = "what the user chose for the base name"),
    },
)
